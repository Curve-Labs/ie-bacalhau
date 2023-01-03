import { task, types } from "hardhat/config";

task("shrine:setup", "Deploys a new instance of Shrine")
  .addParam(
    "avatar",
    "Address of the avatar (e.g. the Gnosis Safe)",
    "undefined",
    types.string
  )
  .setAction(async ({ avatar }, { ethers }) => {
    const Shrine = await ethers.getContractFactory("Shrine");
    const shrine = await Shrine.deploy();

    await shrine.deployed();

    console.log(
      `Shrine deployed with tx ${shrine.deployTransaction.hash} to address ${shrine.address}`
    );

    // we initialize the shrine without a working merkle drop
    // because the merkle drop is supposed to be initiated through reality
    const initialLedger = {
      merkleRoot: ethers.constants.HashZero,
      totalShares: 1,
    };
    const initialIpfsHash = "0";

    await shrine.initialize(avatar, initialLedger, initialIpfsHash);

    return shrine;
  });
