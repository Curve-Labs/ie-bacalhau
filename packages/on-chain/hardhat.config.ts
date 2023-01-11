import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import type { HttpNetworkUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/reality";
import "./tasks/shrine";
import "./tasks/test";

dotenv.config();

const { INFURA_KEY, SEEDPHRASE, ETHERSCAN_API_KEY, PK, ALCHEMY_KEY } =
  process.env;

const HARDHAT_DEFAULT_SEEDPHRASE =
  "test test test test test test test test test test test junk";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
  sharedNetworkConfig.accounts = [PK];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: SEEDPHRASE || HARDHAT_DEFAULT_SEEDPHRASE,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.7",
        settings: {},
      },
    ],
  },
  networks: {
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
  },
};

export default config;
