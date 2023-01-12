import { Contribution } from "./interfaces";
import { ethers } from "ethers";
// @ts-ignore
import { Address } from "ethers";
import * as fs from "fs";
import * as path from "path";

const definedAddresses: Array<Address> = [];

const maxHours: number = 100;
const contributors: number = 10;
const destinationPath = path.join(__dirname, "../inputs/Contributions.json");

const getRandomHoursWorked = (maxHours: number) =>
  Math.floor((Math.random() * 1000) % maxHours);

const generate = (
  definedAddress: Array<Address>,
  maxHours: number,
  contributors: number
) => {
  const numberOfRandomContributors = contributors - definedAddress.length;
  const contributions: Array<Contribution> = [];
  // add defined contributors to list
  for (let i = 0; i < definedAddress.length; i++) {
    const hoursWorked = getRandomHoursWorked(maxHours);
    console.log(hoursWorked);
    const contribution: Contribution = {
      contributor: definedAddress[i],
      shares: hoursWorked,
    };
    contributions.push(contribution);
  }

  // add random contributions to list
  for (let i = 0; i < numberOfRandomContributors; i++) {
    const hoursWorked = getRandomHoursWorked(maxHours);
    const randomeWallet = ethers.Wallet.createRandom().address;
    console.log(hoursWorked);
    const contribution: Contribution = {
      contributor: randomeWallet,
      shares: hoursWorked,
    };
    contributions.push(contribution);
  }

  console.log(contributions);
  return contributions;
};

const main = () => {
  console.log("Generating Mock Contributions Data");
  const contributions = generate(definedAddresses, maxHours, contributors);
  console.log("Mock Contribution data generated");
  console.log("Writing Mock Contribution data");
  const dataTobeWritten = JSON.stringify(contributions, undefined, 4);
  fs.writeFileSync(destinationPath, dataTobeWritten);
  console.log("Mock Data written");
};

main();
