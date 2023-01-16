import { logSuccess } from './../utils/IO';
import { log, logError, readDir } from "../utils/IO";
import { pathToIEFunctionTS, dirOfIEFunction, pathToIEFunctionJS } from "./constants";
import { impactEvaluatorFunction as defaultImpactEvaluatorFunction } from "./example";
import { main } from "./index";

function pathToUse(): string {
  const extension = __filename.split(".").pop();
  return extension === "ts" ? pathToIEFunctionTS : pathToIEFunctionJS;
}

async function execute() {
  // check if file exists
  try {
    const ieDirContents = readDir(dirOfIEFunction);
    if (
      ieDirContents.indexOf("ImpactEvaluatorFunction.ts") !== -1 ||
      ieDirContents.indexOf("ImpactEvaluatorFunction.js") !== -1
    ) {
      log("IE exists. Importing IE and running IE");
      const { impactEvaluatorFunction } = await import(
        pathToUse()
      );
      if (impactEvaluatorFunction === undefined) {
        throw Error(
          "Impact Evaluator function file exists but function is either not exported or not defined"
        );
      } else {
        logSuccess("Impact Evaluator function exists");
      }
      main(impactEvaluatorFunction);
    } else {
      logError("IE doesn't exist, running default IE");
      main(defaultImpactEvaluatorFunction);
    }
  } catch (e) {
    logError(e);
  }
}

execute();
