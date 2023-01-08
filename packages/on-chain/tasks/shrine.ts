import { task, types } from "hardhat/config";

task("shrine:setup", "Deploys a new instance of Shrine")
  .addParam(
    "avatar",
    "Address of the avatar (e.g. the Gnosis Safe)",
    undefined,
    types.string
  )
  .addOptionalParam(
    "ipfs",
    "Ipfs hash that contains metadata of first merkle drop",
    undefined,
    types.string
  )
  .addOptionalParam(
    "root",
    "Merkle root of first merkle drop",
    undefined,
    types.string
  )
  .addOptionalParam(
    "shares",
    "Total shares of first merkle drop",
    undefined,
    types.int
  )
  .setAction(async ({ avatar, ipfs, root, shares }, { ethers }) => {
    const Shrine = await ethers.getContractFactory("Shrine");
    const shrine = await Shrine.deploy();

    await shrine.deployed();

    console.log(
      `Shrine deployed with tx ${shrine.deployTransaction.hash} to address ${shrine.address}`
    );

    const initialLedger = { merkleRoot: root, totalShares: shares };

    // if root & shares are not set
    // we initialize the shrine without a working merkle drop
    // this is useful because the merkle drop is supposed to be initiated through reality
    if (!(root && shares)) {
      initialLedger.merkleRoot = ethers.constants.HashZero;
      initialLedger.totalShares = 1;
    }

    await shrine.initialize(avatar, initialLedger, ipfs || "0");

    return shrine;
  });

task("shrine:offer", "Sends tokens to Shrine to be distributed via merkle drop")
  .addParam("token", "Token address", undefined, types.string)
  .addParam("amount", "Token amount to be sent to Shrine", undefined, types.int)
  .addParam("shrine", "Address of shrine contract", undefined, types.string)
  .setAction(async ({ token, amount, shrine }, { ethers }) => {
    const shrineInstance = await ethers.getContractAt("Shrine", shrine);
    const tx = await shrineInstance.offer(token, amount);

    console.log(
      `Offer ${amount} of token ${token} to shrine ${shrine} in tx ${tx.hash}`
    );
  });
