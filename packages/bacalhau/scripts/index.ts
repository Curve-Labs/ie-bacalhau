// to be run on bacalhau via Docker container
// file system is used to fetch the data from ../inputs/ directory
import * as fs from "fs";
import * as path from "path";
import { successOutput, failedOutput } from "./outputSchema.js";
import { Contribution, Contributions } from "./interfaces";
import { readJson, writeJson, readDir, log, logError } from "./../utils/IO";
import { getMerkleTree } from "../utils/merkleTree";
import {
  inputPath,
  metadataOutputPath,
  merkleTreeOutputPath,
  rewardsOutputPath,
  dataFilePath,
} from "./constants";

// impact evaluator function cannot be asynchronous function
// todo: find how we main() can handle asynchronous functions as well
export function main(impactEvaluatorFunction: any) {
  // read inputs
  log("Reading inputs now...");

  let dataInput: Array<Contribution>;
  try {
    // reading contents of "../inputs" directory
    const contents = readDir(inputPath);
    log("Input directory contains following files:");
    log(contents);
    // if length is 0, no fils exist in input directory
    if (contents.length === 0) {
      log("No input was found");
    }

    // if function input file found, parsing the JSON data of function input file ("./ImpactEvaluatorFunction.json").
    // input data should be in file "./Contributions.json"
    let data: Contributions;

    // read input data
    dataInput = readJson(dataFilePath);

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
    const result = impactEvaluatorFunction(...inputParams);

    // log result
    log("Rewards after running IE Function:");
    log(result);

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
    const merkleTreeOutput = merkleTree.dump();
    const rewardsOutput = {
      rewards: result,
    };
    log("Writing outputs");
    try {
      // write metadata
      log("Writing metadata outputs to", metadataOutputPath);
      writeJson(metadataOutputPath, metadataOutput);

      // write merkle tree
      log("Writing merkle tree outputs to", merkleTreeOutputPath);
      writeJson(merkleTreeOutputPath, merkleTreeOutput);

      // write rewards
      log("writing rewards to:", rewardsOutputPath);
      writeJson(rewardsOutputPath, rewardsOutput);
    } catch (e) {
      // some issue faced while writing
      log("Writing output failed");
      logError(e);
    }

    // for test purpose only, to be removed after enough confidence is achieved
    log("reading output file");
    try {
      const metadataResult = readJson(metadataOutputPath);
      const merkleTreeResult = readJson(merkleTreeOutputPath);
      const rewardsResult = readJson(rewardsOutputPath);
      log({
        metadata: metadataResult,
        merkleTree: merkleTreeResult,
        rewards: rewardsResult,
      });
    } catch (e) {
      log("Reading output file failed");
      logError(e);
    }

    log("Voila!");
  } catch (e) {
    log("Reading failed");
    logError(e);
  }
}
