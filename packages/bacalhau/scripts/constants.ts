import * as path from "path";

const impactEvaluatorTSFileName = "ImpactEvaluatorFunction.ts";
const impactEvaluatorJSFileName = "ImpactEvaluatorFunction.js";
export const inputFiles = ["data.json", "trustedSeed.json", "previousRewards.json"];

// bacalhau by default puts the input data (given via IPFS) into ../inputs directory
export const inputPath: string = path.join(__dirname, "../inputs/");
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
export const outputPath = (): string => path.join(__dirname, `../outputs/`);
export const merkleTreeOutputPath= (): string => path.join(
  __dirname,
  `../outputs/merkleTree.json`
);
export const rewardsOutputPath= (): string => path.join(
  __dirname,
  `../outputs/newRewards.json`
);

export const trustedSeedOutputPath = (): string =>  path.join(
  __dirname,
  `../outputs/newTrustedSeed.json`
);
