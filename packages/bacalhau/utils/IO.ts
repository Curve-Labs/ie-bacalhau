import * as fs from "fs";
export const readJson = (path: string) =>
  JSON.parse(fs.readFileSync(path).toString());

export const writeJson = (path: string, data: any) => {
  const dataToBeWritten = JSON.stringify(data, undefined, 4);
  fs.writeFileSync(path, dataToBeWritten);
};

export const readDir = (path: string) => fs.readdirSync(path);

export const log = console.log;
export const logError = console.error;
