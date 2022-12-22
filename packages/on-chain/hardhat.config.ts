import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

import "./tasks/setup";

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

  external: {
    contracts: [
      {
        artifacts: "../node_modules/@gnosis.pm/zodiac/dist/src/abi",
      },
    ],
  },
};

export default config;
