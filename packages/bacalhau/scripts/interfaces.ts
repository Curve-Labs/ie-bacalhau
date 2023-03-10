// @ts-ignore
import {Address} from "ethers";
export interface IEResult {
  newRewards: any;
  newTrustedSeed: any;
}

export interface InputData {
  data: ContributionsData;
  metadata?: string;
}

export interface ContributionsData {
  [contributor: string]: number | string;
}

export interface IEInputs {
  dataList: Array<InputData>;
  trustedSeedList: Array<Array<Address>>;
  previousRewards: string;
  otherData?: Array<any> | undefined
}

export type MerkleTreeTuple = [Address, number | string];
