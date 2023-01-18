import { logResult } from './../utils/IO';
import { checkAndCreateIfDoesntExist, logProgress, logSuccess, writeJson } from "../utils/IO";
import { ethers } from "ethers";
// @ts-ignore
import { Address } from "ethers";
import * as path from "path";

const definedAddresses: Array<Address> = [];

const maxHours: number = 100;
const contributors: number = 10;
const destinationPath = path.join(__dirname, "../inputs/");
const dataDestinationPath = path.join(destinationPath, "data.json");

interface ContributionData {
  [key: string]: number;
}

const getRandomHoursWorked = (maxHours: number) =>
  Math.floor((Math.random() * 1000) % maxHours);

const generate = (
  definedAddress: Array<Address>,
  maxHours: number,
  contributors: number
) => {
  const numberOfRandomContributors = contributors - definedAddress.length;
  const contributions: ContributionData = {};
  // add defined contributors to list
  for (let i = 0; i < definedAddress.length; i++) {
    const hoursWorked = getRandomHoursWorked(maxHours);
    contributions[definedAddress[i]] = hoursWorked;
  }

  // add random contributions to list
  for (let i = 0; i < numberOfRandomContributors; i++) {
    const hoursWorked = getRandomHoursWorked(maxHours);
    const randomWallet = ethers.Wallet.createRandom().address;
    contributions[randomWallet] = hoursWorked;
  }

  const trustedSeed = Object.keys(contributions);

  logResult(contributions);
  const data = {
    data: contributions,
    trustedSeed: trustedSeed,
    previousRewards: "ipfsCID"
  };
  return { data };
};

const main = () => {
  logProgress("Generating Mock Contributions Data");
  const { data } = generate(
    definedAddresses,
    maxHours,
    contributors
  );
  logSuccess("Mock Contribution data generated");
  logProgress("Writing Mock Contribution data");
  checkAndCreateIfDoesntExist(destinationPath, "Mock Data Destination Path");
  writeJson(dataDestinationPath, data);
  logSuccess("Mock Data written");
};

main();
