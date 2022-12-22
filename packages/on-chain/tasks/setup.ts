// import Safe, { SafeFactory, SafeAccountConfig } from "@gnosis.pm/safe-core-sdk";
// import { Contract } from "ethers";
import { task } from "hardhat/config";
// import EthersAdapter from "@safe-global/safe-ethers-lib";
// import { ContractNetworksConfig } from "@gnosis.pm/safe-core-sdk";

task("setup", "Sets up Gnosis Safe ane Zodiac Reality").setAction(
  async (_, { ethers }) => {
    // const web3Provider = // ...
    // const [deployer, signer1, signer2] = await ethers.getSigners();
    // const ethAdapter = new EthersAdapter({
    //   ethers,
    //   signerOrProvider: deployer,
    // });
    // const chainId = await ethAdapter.getChainId();
    // // if (chainId === 31337) {
    // // }
    // const GnosisSafeProxyFactory = await ethers.getContractFactory(
    //   "GnosisSafeProxyFactory"
    // );
    // const gnosisSafeProxyFactory = GnosisSafeProxyFactory.deploy();
    // const contractNetworks: ContractNetworksConfig = {
    //   [chainId]: {
    //     safeMasterCopyAddress: "<MASTER_COPY_ADDRESS>",
    //     safeProxyFactoryAddress: "<PROXY_FACTORY_ADDRESS>",
    //     multiSendAddress: "<MULTI_SEND_ADDRESS>",
    //     multiSendCallOnlyAddress: "<MULTI_SEND_CALL_ONLY_ADDRESS>",
    //     fallbackHandlerAddress: "<FALLBACK_HANDLER_ADDRESS>",
    //     signMessageLibAddress: "<SIGN_MESSAGE_LIB_ADDRESS>",
    //     createCallAddress: "<CREATE_CALL_ADDRESS>",
    //   },
    // };
    // const safeFactory = await SafeFactory.create({
    //   ethAdapter,
    //   contractNetworks,
    // });
    // const owners = [signer1.address, signer2.address];
    // const threshold = 2;
    // const safeAccountConfig: SafeAccountConfig = {
    //   owners,
    //   threshold,
    // };
    // const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig });
    // console.log(safeSdk);
  }
);
