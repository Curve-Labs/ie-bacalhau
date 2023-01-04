// to be run on bacalhau via Docker container
// file system is used to fetch the data from ../inputs/ directory
import * as fs from "fs";
import * as path from "path";
import {successOutput, failedOutput} from "./outputSchema.js";

// bacalhau by default puts the input data (given via IPFS) into ../inputs directory
const inputPath: string = path.join(__dirname, "../inputs/");
// a standard of outputting all the data in one big JSON file with defined schema
const outputPath: string = path.join(__dirname, "../outputs/output.json");

// read inputs
console.log("Reading inputs now...");

let inputs: any;
try {
  // reading contents of "../inputs" directory
  const contents = fs.readdirSync(inputPath);
  // if length is 0, no fils exist in input directory
  if (contents.length === 0) {
    console.log("No input was found");
  }
  // if input found, parsing the JSON data of first file in the directory.
  // the data should be in one file only, that is first
  // or, make your custom code take the necessary steps
  inputs = JSON.parse(fs.readFileSync(inputPath + contents[0]).toString());

  let ieFunction;
  let data;

  // checking if the input contain function property or not
  // custom impact evaluator function should be stored with property 'function'
  if (inputs.function !== undefined) {
    // get the function logic code
    const functionCode = inputs.function.code;
    // get the array of params
    const params = inputs.function.params;
    // instantiate function
    ieFunction = new Function(...params, functionCode);
  } else {
    // if now function found, no evaluation can be made
    throw Error("No Impact Evaluator Function found");
  }

  // fetch data
  if(inputs.data !== undefined) {
    // todo: fix the logic of storing data properly
    data = [inputs.data.param1, inputs.data.param2];
    // todo: some processing of data needs to be done
    data = data.map(i=>parseInt(i));
  } else {
    // if now data found, what evaluation can be made
    throw Error("No data found to be evaluated");
  }

  // run ie function
  const result = ieFunction(...data);

  // log result
  console.log(result);

  // todo: apply merkle tree logic

  // write outputs
  console.log("Writing outputs");
  try {
    // generated output object
    const output = {
      isOutput: true,
      result: result,
      inputs: inputs.length === 0 ? "No Input found" : inputs,
    };
    const dataToBeWritten = JSON.stringify(output, undefined, 4);
    fs.writeFileSync(outputPath, dataToBeWritten);
  } catch (e) {
    // some issue faced while writing
    console.log("Writing output failed");
    console.log(e);
  }

  // for test purpose only, to be removed after enough confidence is achieved
  console.log("reading output file");
  try {
    const data = fs.readFileSync(outputPath);
    console.log(JSON.parse(data.toString()));
  } catch (e) {
    console.log("Reading output file failed");
    console.log(e);
  }

  console.log("Voila!");
} catch (e) {
  console.log("Reading failed");
  console.log(e);
}
