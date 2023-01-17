import * as fs from "fs";
import { inputFiles } from "../scripts/constants";
export const readJson = (path: string) =>
  JSON.parse(fs.readFileSync(path).toString());

export const writeJson = (path: string, data: any) => {
  const dataToBeWritten = JSON.stringify(data, undefined, 4);
  fs.writeFileSync(path, dataToBeWritten);
};

export const readDir = (path: string) => fs.readdirSync(path);

// different instance of log to help in readability of logs
export const log = console.log;
export const logError = console.error;
export const logProgress = (progressMessage: string) =>
  console.log(`${progressMessage}...`);
export const logSuccess = console.log;
export const logResult = console.log;
export const logRoundStart = (round: string) => {
  log(" ----------------------------------------------------------------");
  log("|                                                                |");
  log(`  Running Impact Evaluator function on data provided in ${round}`);
  log("|                                                                |");
  log(" ----------------------------------------------------------------");
};

export function isDirectory(pathToDirectory: string): boolean {
  return fs.statSync(pathToDirectory).isDirectory();
}

export function filesExist(directory: string): boolean {
  const fileExistenceList = inputFiles.filter(
    (inputFile: string) => !fs.existsSync(`${directory}/${inputFile}`)
  );
  const concatenatedMissingInputFiles = fileExistenceList.reduce(
    (prev, missingFile) => missingFile + " " + prev,
    ""
  );
  if(concatenatedMissingInputFiles.length>0) {
    log(
      `Following files don't exists: ${concatenatedMissingInputFiles}`
    );
  }
  return fileExistenceList.length === 0;
}

export const checkAndCreateIfDoesntExist = (path: string, pathName: string) => {
  logProgress(`Checking if ${pathName} directory ${path} exists`);
  if (!fs.existsSync(path)) {
    logProgress(`${pathName} path doesn't exists. Creating now`);
    fs.mkdirSync(path);
    logSuccess(`${pathName} directory created`);
  } else {
    logSuccess(`${pathName} directory exists`);
  }
};
