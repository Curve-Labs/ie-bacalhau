// to be run on bacalhau via Docker container
// file system is used to fetch the data from ../inputs/ directory
import * as fs from "fs";
import * as path from "path";
import { successOutput, failedOutput } from "./outputSchema.js";
import { Contribution, Contributions } from "./interfaces";
import { getMerkleTree } from "../utils/merkleTree";

// bacalhau by default puts the input data (given via IPFS) into ../inputs directory
const inputPath: string = path.join(__dirname, "../inputs/");
const functionFileName = "ImpactEvaluatorFunction.json";
const inputFileName = "Contributions.json";
// a standard of outputting all the data in one big JSON file with defined schema
const metadataOutputPath: string = path.join(
  __dirname,
  "../outputs/metadata.json"
);
const merkleTreeOutputPath: string = path.join(
  __dirname,
  "../outputs/merkleTree.json"
);

// read inputs
console.log("Reading inputs now...");

let functionInput: any;
let dataInput: Array<Contribution>;
try {
  // reading contents of "../inputs" directory
  const contents = fs.readdirSync(inputPath);
  console.log("Input directory contains following files:");
  console.log(contents);
  // if length is 0, no fils exist in input directory
  if (contents.length === 0) {
    console.log("No input was found");
  }

  // if function input file found, parsing the JSON data of function input file ("./ImpactEvaluatorFunction.json").
  // input data should be in file "./Contributions.json"
  functionInput = JSON.parse(
    fs.readFileSync(path.join(inputPath, functionFileName)).toString()
  );
  let ieFunction: Function;
  let data: Contributions;

  // checking if the input contain function property or not
  // custom impact evaluator function should be stored with property 'function'
  if (functionInput.function !== undefined) {
    // get the function logic code
    const functionCode: string = functionInput.function.code;
    // get the array of params
    const params: Array<string> = functionInput.function.params;
    // instantiate function
    ieFunction = new Function(...params, functionCode);
  } else {
    // if now function found, no evaluation can be made
    throw Error("No Impact Evaluator Function found");
  }

  // read input data
  dataInput = JSON.parse(
    fs.readFileSync(path.join(inputPath, inputFileName)).toString()
  );

  // fetch data
  if (dataInput.length !== undefined || dataInput.length !== 0) {
    const totalShares = dataInput.reduce(
      (totalShares, contribution) => contribution.shares + totalShares,
      0
    );
    data = {
      totalShares: totalShares,
      contributions: dataInput,
    };
  } else {
    // if now data found, what evaluation can be made
    throw Error("No data found to be evaluated");
  }

  // run ie function
  const inputParams = [data.contributions];
  const result = ieFunction(...inputParams);

  // log result
  console.log("Rewards after running IE Function:");
  console.log(result);

  // generate merkle tree
  const inputForMerkleTree = result.map((contribution: Contribution) => [
    contribution.contributor,
    contribution.shares,
  ]);
  const merkleTree = getMerkleTree(inputForMerkleTree);

  // write outputs
  merkleTree.root;
  const metadataOutput = {
    success: true,
    merkleRoot: merkleTree.root,
    contributions: data,
  };
  const merkleTreeOutput = {
    tree: merkleTree.dump(),
    inputs: result,
  };
  console.log("Writing outputs");
  try {
    // write metadata
    console.log("Writing metadata outputs to", metadataOutputPath);
    const metadataToBeWritten = JSON.stringify(metadataOutput, undefined, 4);
    fs.writeFileSync(metadataOutputPath, metadataToBeWritten);

    // write merkle tree
    console.log("Writing merkle tree outputs to", merkleTreeOutputPath);
    const merkleTreeToBeWritten = JSON.stringify(
      merkleTreeOutput,
      undefined,
      4
    );
    fs.writeFileSync(merkleTreeOutputPath, merkleTreeToBeWritten);
  } catch (e) {
    // some issue faced while writing
    console.log("Writing output failed");
    console.log(e);
  }

  // for test purpose only, to be removed after enough confidence is achieved
  console.log("reading output file");
  try {
    const metadataResult = fs.readFileSync(metadataOutputPath);
    const merkleTreeResult = fs.readFileSync(merkleTreeOutputPath);
    console.log({
      metadata: JSON.parse(metadataResult.toString()),
      merkleTree: JSON.parse(merkleTreeResult.toString()),
    });
  } catch (e) {
    console.log("Reading output file failed");
    console.log(e);
  }

  console.log("Voila!");
} catch (e) {
  console.log("Reading failed");
  console.log(e);
}
