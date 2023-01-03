import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task, types } from "hardhat/config";
import { deployAndSetUpModule } from "@gnosis.pm/zodiac";
import defaultTemplate from "./defaultTemplate.json";
import { BytesLike, Contract } from "ethers";

interface RealityTaskArgs {
  owner: string;
  avatar: string;
  target: string;
  oracle: string;
  timeout: string;
  cooldown: string;
  expiration: string;
  bond: string;
  template: string;
  proxied: boolean;
  iserc20: boolean;
  arbitrator: string;
}

interface Contracts {
  [key: string]: Contract;
}

const deployRealityModule = async (
  taskArgs: RealityTaskArgs,
  hardhatRuntime: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const [caller] = await hardhatRuntime.ethers.getSigners();
  console.log("Using the account:", caller.address);

  if (taskArgs.proxied) {
    const chainId = await hardhatRuntime.getChainId();
    const module = taskArgs.iserc20 ? "realityERC20" : "realityETH";
    const { transaction } = deployAndSetUpModule(
      module,
      {
        types: [
          "address",
          "address",
          "address",
          "address",
          "uint32",
          "uint32",
          "uint32",
          "uint256",
          "uint256",
          "address",
        ],
        values: [
          taskArgs.owner,
          taskArgs.avatar,
          taskArgs.target,
          taskArgs.oracle,
          taskArgs.timeout,
          taskArgs.cooldown,
          taskArgs.expiration,
          taskArgs.bond,
          taskArgs.template,
          taskArgs.oracle,
        ],
      },
      hardhatRuntime.ethers.provider,
      Number(chainId),
      Date.now().toString()
    );
    const deploymentTransaction = await caller.sendTransaction(transaction);
    const receipt = await deploymentTransaction.wait();
    console.log("Module deployed to:", receipt.logs[1].address);
  }

  const ModuleName = taskArgs.iserc20
    ? "RealityModuleERC20"
    : "RealityModuleETH";
  const Module = await hardhatRuntime.ethers.getContractFactory(ModuleName);
  const module = await Module.deploy(
    taskArgs.owner,
    taskArgs.avatar,
    taskArgs.target,
    taskArgs.oracle,
    taskArgs.timeout,
    taskArgs.cooldown,
    taskArgs.expiration,
    taskArgs.bond,
    taskArgs.template,
    taskArgs.oracle
  );
  await module.deployTransaction.wait();
  console.log("ZodiacReality deployed to:", module.address);

  return module;
};

task("reality:setup", "Provides the clearing price to an auction")
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam(
    "avatar",
    "Address of the avatar (e.g. Safe)",
    undefined,
    types.string
  )
  .addParam("target", "Address of the target", undefined, types.string)
  .addParam(
    "oracle",
    "Address of the oracle (e.g. Reality.eth)",
    undefined,
    types.string
  )
  .addParam(
    "template",
    "Template that should be used for proposal questions (See http://reality.eth.link/app/docs/html/whitepaper.html#structuring-and-fetching-information)",
    undefined,
    types.string
  )
  .addParam(
    "timeout",
    "Timeout in seconds that should be required for the oracle",
    48 * 3600,
    types.int,
    true
  )
  .addParam(
    "cooldown",
    "Cooldown in seconds that should be required after a oracle provided answer",
    24 * 3600,
    types.int,
    true
  )
  .addParam(
    "expiration",
    "Time duration in seconds for which a positive answer is valid. After this time the answer is expired",
    7 * 24 * 3600,
    types.int,
    true
  )
  .addParam(
    "bond",
    "Minimum bond that is required for an answer to be accepted",
    "0",
    types.string,
    true
  )
  .addParam(
    "proxied",
    "Deploys module through proxy factory",
    false,
    types.boolean,
    true
  )
  .addParam(
    "iserc20",
    "Defines if Reality is deployed for ETH or ERC20. By default is false",
    false,
    types.boolean,
    true
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    return await deployRealityModule(taskArgs, hardhatRuntime);
  });

task("verifyEtherscan", "Verifies the contract on etherscan")
  .addParam("module", "Address of the module", undefined, types.string)
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam(
    "avatar",
    "Address of the avatar (e.g. Safe)",
    undefined,
    types.string
  )
  .addParam("target", "Address of the target", undefined, types.string)
  .addParam(
    "oracle",
    "Address of the oracle (e.g. Reality.eth)",
    undefined,
    types.string
  )
  .addParam(
    "template",
    "Template that should be used for proposal questions (See http://reality.eth.link/app/docs/html/whitepaper.html#structuring-and-fetching-information)",
    undefined,
    types.string
  )
  .addParam(
    "timeout",
    "Timeout in seconds that should be required for the oracle",
    48 * 3600,
    types.int,
    true
  )
  .addParam(
    "cooldown",
    "Cooldown in seconds that should be required after a oracle provided answer",
    24 * 3600,
    types.int,
    true
  )
  .addParam(
    "expiration",
    "Time duration in seconds for which a positive answer is valid. After this time the answer is expired",
    7 * 24 * 3600,
    types.int,
    true
  )
  .addParam("arbitrator", "Arbitrator address", undefined, types.string)
  .addParam(
    "bond",
    "Minimum bond that is required for an answer to be accepted",
    "0",
    types.string,
    true
  )
  .setAction(
    async (taskArgs: RealityTaskArgs & { module: string }, hardhatRuntime) => {
      await hardhatRuntime.run("verify", {
        address: taskArgs.module,
        constructorArgsParams: [
          taskArgs.owner,
          taskArgs.avatar,
          taskArgs.target,
          taskArgs.oracle,
          `${taskArgs.timeout}`,
          `${taskArgs.cooldown}`,
          `${taskArgs.expiration}`,
          `${taskArgs.bond}`,
          taskArgs.template,
          taskArgs.arbitrator,
        ],
      });
    }
  );

task(
  "reality:createDaoTemplate",
  "Creates a question template on the oracle address"
)
  .addParam(
    "oracle",
    "Address of the oracle (e.g. Reality.eth)",
    undefined,
    types.string
  )
  .addParam(
    "template",
    "Template string for question (should include placeholders for proposal id and txs hash)",
    JSON.stringify(defaultTemplate),
    types.string,
    true
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    const [caller] = await hardhatRuntime.ethers.getSigners();
    console.log("Using the account:", caller.address);
    console.log("Creating template:", taskArgs.template);
    const oracle = await hardhatRuntime.ethers.getContractAt(
      "RealitioV3",
      taskArgs.oracle
    );

    const receipt = await oracle
      .createTemplate(JSON.stringify(defaultTemplate))
      .then((tx: any) => tx.wait());

    const id = receipt.logs[0].topics[1];
    console.log("Template id:", id);
    return id;
  });

task("reality:propose", "Proposes a merkle drop via Shrine")
  .addParam("module", "Address of the reality module", undefined, types.string)
  .addParam(
    "oracle",
    "Address of the oracle (e.g. Reality.eth)",
    "undefined",
    types.string
  )
  .addParam("shrine", "Address of the shrine", "undefined", types.string)
  .addParam(
    "ipfs",
    "Ipfs hash that contains metadata for drop",
    "undefined",
    types.string
  )
  .addParam(
    "token",
    "Address of the token to be offered",
    undefined,
    types.string
  )
  .addParam(
    "root",
    "Merkle Root that includes all champions",
    undefined,
    types.string
  )
  .addParam("amount", "Amount of the token to be offered", undefined, types.int)
  .addParam("id", "Id of proposal", undefined, types.string)
  .setAction(
    async (
      { module, oracle, token, amount, id, shrine, root, ipfs },
      { ethers, deployments }
    ) => {
      const realityModule = await ethers.getContractAt(
        "RealityModuleETH",
        module
      );
      const shrineInstance = await ethers.getContractAt("Shrine", shrine);

      let nonce = 0;

      // tx1: approve token
      const tokenContract = await ethers.getContractAt("TestToken", token);
      const tx1 = await tokenContract.populateTransaction.approve(
        shrine,
        amount
      );
      const tx1Hash = await realityModule.getTransactionHash(
        tx1.to as string,
        0,
        tx1.data as BytesLike,
        0,
        nonce
      );
      nonce++;

      // tx2: update ledger of Shrine
      const tx2 = await shrineInstance.populateTransaction.updateLedger({
        merkleRoot: root,
        totalShares: amount,
      });
      const tx2Hash = await realityModule.getTransactionHash(
        tx2.to as string,
        0,
        tx2.data as BytesLike,
        0,
        nonce
      );
      nonce++;

      // tx3: update ledger metadata of Shrine
      const currentVersion = await shrineInstance.currentLedgerVersion();
      const tx3 = await shrineInstance.populateTransaction.updateLedgerMetadata(
        currentVersion.add(1),
        ipfs
      );
      const tx3Hash = await realityModule.getTransactionHash(
        tx3.to as string,
        0,
        tx3.data as BytesLike,
        0,
        nonce
      );
      nonce++;

      // tx4: offer token to Shrine
      const tx4 = await shrineInstance.populateTransaction.offer(token, amount);
      const tx4Hash = await realityModule.getTransactionHash(
        tx4.to as string,
        0,
        tx4.data as BytesLike,
        0,
        nonce
      );

      const txs = [tx1, tx2, tx3, tx4];
      const txHashes = [tx1Hash, tx2Hash, tx3Hash, tx4Hash];
      const tx = await realityModule.addProposal(id, txHashes);

      console.log("addProposal tx: ", tx.hash);

      return { tx, txs, txHashes };
    }
  );