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
  .setAction(
    async ({ avatar, ipfs, root, shares }, { ethers, deployments }) => {
      const { deploy } = deployments;
      const [signer] = await ethers.getSigners();

      const deployResult = await deploy("Shrine", {
        from: signer.address,
        args: [],
        log: true,
      });

      console.log(
        `Shrine deploying with tx ${deployResult.receipt?.transactionHash} to address ${deployResult.address}`
      );

      const shrine = await ethers.getContractAt(
        "Shrine",
        deployResult.address,
        signer
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
    }
  );

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

task("shrine:verifyEtherscan", "Verifies Shrine contract on Etherscan")
  .addParam("shrine", "Address of Shrine contract", "undefined", types.string)
  .setAction(async ({ shrine }, { ethers, run }) => {
    await run("verify", {
      address: shrine,
      constructorArgsParams: [],
    });
  });
