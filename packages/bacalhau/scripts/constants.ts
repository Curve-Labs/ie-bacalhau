import * as path from "path";

const functionFileName = "ImpactEvaluatorFunction.json";
const inputFileName = "Contributions.json";
const impactEvaluatorTSFileName = "ImpactEvaluatorFunction.ts";
const impactEvaluatorJSFileName = "ImpactEvaluatorFunction.js";

// bacalhau by default puts the input data (given via IPFS) into ../inputs directory
export const inputPath: string = path.join(__dirname, "../inputs/");
export const functionFilePath: string = path.join(inputPath, functionFileName);
export const dataFilePath: string = path.join(inputPath, inputFileName);
export const dirOfIEFunction = path.join(__dirname, "../ImpactEvaluator/");
export const pathToIEFunctionTS = path.join(
  dirOfIEFunction,
  impactEvaluatorTSFileName
);
export const pathToIEFunctionJS = path.join(
  dirOfIEFunction,
  impactEvaluatorJSFileName
);

// a standard of outputting all the data in one big JSON file with defined schema
export const metadataOutputPath: string = path.join(
  __dirname,
  "../outputs/metadata.json"
);
export const merkleTreeOutputPath: string = path.join(
  __dirname,
  "../outputs/merkleTree.json"
);
export const rewardsOutputPath: string = path.join(
  __dirname,
  "../outputs/rewards.json"
);
