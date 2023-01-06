// @ts-ignore
import {Address} from "ethers";

export interface Contribution {
  contributor: Address;
  shares: number;
}

export interface Contributions {
  totalShares: number;
  contributions: Array<Contribution>;
}
