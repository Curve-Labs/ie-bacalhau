import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task, types } from "hardhat/config";
import { deployAndSetUpModule } from "@gnosis.pm/zodiac";
import defaultTemplate from "./defaultTemplate.json";
import { BytesLike, Contract, ContractTransaction } from "ethers";
import realityEthAbi from "../../../node_modules/@reality.eth/contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json";

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

const deployRealityModule = async (
  taskArgs: RealityTaskArgs,
  hardhatRuntime: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const [caller] = await hardhatRuntime.ethers.getSigners();
  const { deploy } = await hardhatRuntime.deployments;

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

  const deployObject = await deploy(ModuleName, {
    from: caller.address,
    args: [
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
  });

  const module = await hardhatRuntime.ethers.getContractAt(
    ModuleName,
    deployObject.address
  );

  return module;
};

task("reality:setup", "Deploys a Zodiac Reality module")
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

task("reality:verifyEtherscan", "Verifies the contract on etherscan")
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
          taskArgs.oracle,
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
      .then((tx: ContractTransaction) => tx.wait());

    const id = receipt.logs[0].topics[1];
    console.log("Template id:", id);
    return id;
  });

task("reality:assemble", "Assembles a proposal for reality module")
  .addParam("module", "Address of the reality module", undefined, types.string)
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
  .setAction(
    async ({ module, token, amount, shrine, root, ipfs }, { ethers }) => {
      const realityModule = await ethers.getContractAt(
        "RealityModuleETH",
        module
      );
      const shrineInstance = await ethers.getContractAt("Shrine", shrine);
      const tokenContract = await ethers.getContractAt("TestToken", token);

      const txs = [
        await tokenContract.populateTransaction.approve(shrine, amount),
        await shrineInstance.populateTransaction.updateLedger({
          merkleRoot: root,
          totalShares: amount,
        }),
        await shrineInstance.populateTransaction.updateLedgerMetadata(
          (await shrineInstance.currentLedgerVersion()).add(1),
          ipfs
        ),
        await shrineInstance.populateTransaction.offer(token, amount),
      ];

      const txHashes = [];
      let nonce = 0;
      for (let i = 0; i < txs.length; i++) {
        const txHash = await realityModule.getTransactionHash(
          txs[i].to as string,
          0,
          txs[i].data as BytesLike,
          0,
          nonce
        );
        txHashes.push(txHash);
        nonce++;
      }

      return { txs, txHashes };
    }
  );

task("reality:propose", "Proposes a merkle drop via Shrine to reality module")
  .addParam("module", "Address of the reality module", undefined, types.string)
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
      { module, token, amount, id, shrine, root, ipfs },
      { ethers, run }
    ) => {
      const realityModule = await ethers.getContractAt(
        "RealityModuleETH",
        module
      );

      const { txHashes } = await run("reality:assemble", {
        module,
        token,
        amount,
        id,
        root,
        shrine,
        ipfs,
      });

      const tx = await realityModule.addProposal(id, txHashes);

      console.log("addProposal tx: ", tx.hash);

      return tx;
    }
  );

task(
  "reality:execute",
  "Initiates a finalized airdrop proposal via reality module"
)
  .addParam("module", "Address of the reality module", undefined, types.string)
  .addParam(
    "oracle",
    "Address of the oracle (e.g. Reality.eth)",
    "undefined",
    types.string
  )
  .addParam("shrine", "Address of the shrine", "undefined", types.string)
  .addParam(
    "token",
    "Address of the token to be offered",
    undefined,
    types.string
  )
  .addParam("amount", "Amount of the token to be offered", undefined, types.int)
  .addParam(
    "root",
    "Merkle Root that includes all champions",
    undefined,
    types.string
  )
  .addParam(
    "ipfs",
    "Ipfs hash that contains metadata for drop",
    "undefined",
    types.string
  )
  .addParam("id", "Id of proposal", undefined, types.string)
  .setAction(
    async (
      { module, token, amount, shrine, root, id, ipfs },
      { ethers, run }
    ) => {
      const realityModule = await ethers.getContractAt(
        "RealityModuleETH",
        module
      );

      const { txHashes, txs } = await run("reality:assemble", {
        module,
        token,
        amount,
        id,
        root,
        shrine,
        ipfs,
      });

      let txIndex = 0;
      const transactions = [];
      for (let i = 0; i < txHashes.length; i++) {
        const tx = await realityModule.executeProposalWithIndex(
          id,
          txHashes,
          txs[txIndex].to,
          0,
          txs[txIndex].data,
          0,
          txIndex
        );
        transactions.push(tx);
        txIndex++;
      }

      console.log("Tx hash for approving tokens: ", transactions[0].hash);
      console.log("Tx hash for updating shrine ledger: ", transactions[1].hash);
      console.log(
        "Tx hash for updating ledger metadata: ",
        transactions[2].hash
      );
      console.log(
        "Tx hash for offering tokens to Shrine: ",
        transactions[3].hash
      );

      return transactions;
    }
  );

task("reality:answer", "Submits an answer to a reality question")
  .addParam("module", "Address of the reality module", undefined, types.string)
  .addParam(
    "question",
    "Question ID of proposal (assigned by oracle)",
    undefined,
    types.string
  )
  .addParam(
    "bond",
    "ETH bond placed to answer question",
    undefined,
    types.string
  )
  .setAction(async ({ module, question, bond }, { ethers }) => {
    const [deployer] = await ethers.getSigners();
    const realityModule = await ethers.getContractAt(
      "RealityModuleETH",
      module
    );
    const realityEthAddress = await realityModule.oracle();
    const realityEth = new ethers.Contract(
      realityEthAddress,
      realityEthAbi,
      deployer
    );
    const trueAsBytes32 = ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 32);

    await realityEth.submitAnswer(question, trueAsBytes32, 0, {
      value: bond,
    });
  });
