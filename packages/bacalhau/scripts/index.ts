import {
  checkAndCreateIfDoesntExist,
  logProgress,
  logResult,
  logRoundStart,
} from "./../utils/IO";
// to be run on bacalhau via Docker container
// file system is used to fetch the data from ../inputs/ directory
import { IEInputs, IEResult, MerkleTreeTuple } from "./interfaces";
import {
  readJson,
  writeJson,
  readDir,
  log,
  logError,
  logSuccess,
} from "./../utils/IO";
import { getMerkleTree } from "../utils/merkleTree";
import {
  inputPath,
  merkleTreeOutputPath,
  rewardsOutputPath,
  trustedSeedOutputPath,
  outputPath,
} from "./constants";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// impact evaluator function cannot be asynchronous function
// todo: find how we main() can handle asynchronous functions as well
export function main(impactEvaluatorFunction: any) {
  // reading contents of "../inputs" directory
  const contents = readDir(inputPath);
  log("Input directory contains following files:");
  log(contents);
  // if length is 0, no fils exist in input directory
  if (contents.length === 0) {
    logError("No input was found");
  } else {
      // check if directory contains necessary files
      log(`Using data from following file: ${contents[0]}`);

      const input = readJson(`${inputPath}/${contents[0]}`);

      // execute
      // read data
      // read inputs
      logProgress("Reading inputs now");

      const inputs: IEInputs = {
        dataList: [],
        trustedSeedList: [],
        previousRewards: "",
        otherData: [],
      };

      // read data
      const inputFileKeys = Object.keys(input)
      for (const key of inputFileKeys) {
        try {
          const keyData = input[key];
          if (key.includes("data")) {
            logSuccess("data found in ", key);
            inputs.dataList.push({data: keyData});
          } else if (key.includes("trustedSeed")) {
            logSuccess("trsusted seed found in ", key);
            inputs.trustedSeedList.push(keyData);
          } else if (key.includes("previousRewards")) {
            logSuccess("previousRewards found in ", key);
            inputs.previousRewards = keyData;
          } else {
            logError("Extra data found: ", key);
            inputs.otherData?.push(keyData);
          }
        } catch (e) {
          logError(`Reading Inputs for ${key} failed`);
          logError(e);
        }
      }

      logResult("Inputs are:", inputs);

      // // pass data
      logProgress(`Running IE function on data`);
      let resultForCurrentRound: IEResult | undefined;
      try {
        // todo: collect and pass extra data
        resultForCurrentRound = impactEvaluatorFunction(
          inputs.dataList,
          inputs.trustedSeedList,
          inputs.previousRewards
        );
      } catch (e) {
        // to ensure an error can be thrown to stop execution
        resultForCurrentRound = undefined;
        logError("Error while executing IE function");
        logError(e);
      }

      // cannot progress ahead if IE function execution failed
      if (resultForCurrentRound === undefined) {
        throw Error("Error in IE function execution");
      }

      logSuccess("Impact Evaluation function successfully executed.");
      logResult("IE output:", resultForCurrentRound);

      // result should contain data as following
      // result will now contain two properties
      // 1. newRewards
      // 2. newTrsutedSeed

      // generate merkle tree
      logProgress("Preparing inputs for merkle tree");

      let inputForMerkleTree: Array<MerkleTreeTuple> = [];

      // new rewards needs to be an object
      if (
        typeof resultForCurrentRound.newRewards !== "object" ||
        resultForCurrentRound.newRewards === null
      ) {
        throw Error("New Rewards in IE output is not an object");
      }

      // as new rewards is an object, we first prepare an array of all the keys
      const contributors = Object.keys(resultForCurrentRound.newRewards);

      // then we loop over the keys to convert them into a format which can be passed into merkle tree generator
      try {
        for (const contributor of contributors) {
          inputForMerkleTree.push([
            contributor,
            resultForCurrentRound.newRewards[contributor],
          ]);
        }
      } catch (e) {
        logError(
          "Error in formatting IE output to merkle tree generator output"
        );
        logError(e);
      }
      logResult("Input ready for merkle tree:", inputForMerkleTree);

      logProgress("Generating Merkle Tree");
      let merkleTree: StandardMerkleTree<string[]> | undefined;
      try {
        merkleTree = getMerkleTree(inputForMerkleTree);
      } catch (e) {
        // to ensure an error can be thrown to stop execution
        merkleTree = undefined;
        logError("Error in generating merkle tree");
        logError(e);
      }
      logSuccess("Merkle tree generated!");

      // cannot progress ahead without merkle tree generation
      if (merkleTree === undefined) {
        throw Error("Error in Merkle tree generation");
      }

      // write data

      // check if output directory exists
      checkAndCreateIfDoesntExist(outputPath(), "Output");

      // 1. merkle tree
      const treeOutput = merkleTree.dump();
      try {
        writeJson(merkleTreeOutputPath(), treeOutput);
      } catch (e) {
        logError("Failed at writing output for Merkle Tree");
        logError(e);
      }
      // 2. new rewards
      try {
        writeJson(rewardsOutputPath(), resultForCurrentRound.newRewards);
      } catch (e) {
        logError("Failed at writing output for New Rewards");
        logError(e);
      }
      // 3. new trusted seed
      try {
        writeJson(
          trustedSeedOutputPath(),
          resultForCurrentRound.newTrustedSeed
        );
      } catch (e) {
        logError(
          "Failed at writing output for new Trust Seed"
        );
        logError(e);
      }

      logProgress("reading output file");
      try {
        const newTrustedSeed = readJson(trustedSeedOutputPath());
        const merkleTreeResult = readJson(merkleTreeOutputPath());
        const rewardsResult = readJson(rewardsOutputPath());
        log({
          newTrustedSeed: newTrustedSeed,
          merkleTree: merkleTreeResult,
          rewards: rewardsResult,
        });
      } catch (e) {
        logError("Reading output file failed");
        logError(e);
      }

      logSuccess("Shaandaar!");
    }
}
