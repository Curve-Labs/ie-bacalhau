import path from "path";
import { promises } from "fs";

import { expect } from "chai";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractReceipt, Transaction } from "ethers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

import template from "../tasks/defaultTemplate.json";
import realityEthAbi from "../../../node_modules/@reality.eth/contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json";
import { getMerkleTree } from "../utils/merkleTree";

describe("Airdrop", function () {
  let deployer: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;
  let testAvatar: Contract,
    realityModule: Contract,
    shrine: Contract,
    mock: Contract,
    testToken: Contract,
    realityEth: Contract,
    templateId: string;

  let tree: StandardMerkleTree<string[]>;

  const timeout = 42;
  const cooldown = 23;
  const expiration = 0;
  const bond = "1000";

  const user1Amount = "50";
  const user2Amount = "50";

  async function deployFixture() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const TestAvatar = await ethers.getContractFactory("TestAvatar");
    const testAvatar = await TestAvatar.deploy();

    const Mock = await ethers.getContractFactory("MockContract");
    const mock = await Mock.deploy();

    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy("TestToken", "TT");
    const maxUint = ethers.constants.MaxUint256;
    await testToken.mint(testAvatar.address, maxUint);

    const realityEthBytecode = await promises.readFile(
      path.join(
        __dirname,
        "../../../node_modules/@reality.eth/contracts/bytecode/RealityETH-3.0.bin"
      )
    );
    const RealityEth = new ethers.ContractFactory(
      realityEthAbi,
      realityEthBytecode.toString("binary"),
      deployer
    );

    const realityEth = await RealityEth.deploy();

    return {
      deployer,
      user1,
      user2,
      testAvatar,
      testToken,
      realityEth,
      mock,
    };
  }

  before(
    "deploy test contracts: testAvatar (= Safe), testToken, realitio, shrine, mock",
    async () => {
      ({ deployer, user1, user2, testAvatar, testToken, realityEth, mock } =
        await loadFixture(deployFixture));
    }
  );

  describe("configuring the governance components", () => {
    it("creates a realitio template", async () => {
      templateId = await run("reality:createDaoTemplate", {
        oracle: realityEth.address,
        template: JSON.stringify(template),
      });
    });

    it("sets up the reality module", async () => {
      realityModule = await run("reality:setup", {
        owner: deployer.address,
        avatar: testAvatar.address,
        target: testAvatar.address,
        oracle: realityEth.address,
        timeout,
        cooldown,
        expiration,
        bond,
        template: templateId,
        arbitrator: mock.address,
      });
    });

    after("enable reality module on testAvatar", async () => {
      await testAvatar.enableModule(realityModule.address); // in prod: to be done on the Gnosis Safe by the Gnosis Safe
    });
  });

  describe("initiating a merkle drop", () => {
    const amount = 100;
    const proposalId = ethers.utils.hexZeroPad("0x01", 32);
    const ipfsHash = "example_ipfs";

    let questionId: string;

    before("setup merkle tree", async () => {
      // set up a merkle tree
      const values = [
        [user1.address, user1Amount],
        [user2.address, user2Amount],
      ];
      tree = getMerkleTree(values);
    });

    it("deploys a Shrine contract with the avatar as owner", async () => {
      shrine = await run("shrine:setup", { avatar: testAvatar.address });

      expect(await shrine.owner()).to.equal(testAvatar.address);
    });

    it("adds the proposal to reality.eth", async () => {
      const tx = await run("reality:propose", {
        module: realityModule.address,
        token: testToken.address,
        amount,
        id: proposalId,
        root: tree.root,
        shrine: shrine.address,
        ipfs: ipfsHash,
      });

      await expect(tx).to.emit(realityModule, "ProposalQuestionCreated");

      // listen to event and store questionId
      const receipt: ContractReceipt = await tx.wait();
      const event = receipt.events?.find(
        (log) => log.event === "ProposalQuestionCreated"
      );
      event && event.args && (questionId = event.args[0]);
    });

    describe("executing the proposal", async () => {
      let transactions: Transaction[];

      before("finalize answer on reality eth", async () => {
        await run("reality:answer", {
          module: realityModule.address,
          question: questionId,
          bond,
        });
        await mine(69); // timetravel into the future to a distant time beyond the cooldown ;P
      });

      before("execute the proposal", async () => {
        transactions = await run("reality:execute", {
          module: realityModule.address,
          token: testToken.address,
          amount,
          id: proposalId,
          root: tree.root,
          shrine: shrine.address,
          ipfs: ipfsHash,
        });
      });

      it("increments ledger version", async () => {
        expect(await shrine.currentLedgerVersion()).to.equal(2);
      });

      it("updates ledger metadata", async () => {
        await expect(transactions[2])
          .to.emit(shrine, "UpdateLedgerMetadata")
          .withArgs(2, ipfsHash);
      });

      it("transfers tokens to Shrine", async () => {
        await expect(transactions[3])
          .to.emit(shrine, "Offer")
          .withArgs(testAvatar.address, testToken.address, amount);
      });
    });
  });

  describe("claiming a merkle drop", () => {
    it("pays out the tokens", async () => {
      const claimInfo = {
        version: 2,
        token: testToken.address,
        champion: user1.address,
        shares: user1Amount,
        merkleProof: tree.getProof(0),
      };
      await shrine.connect(user1).claim(user1.address, claimInfo);

      expect(await testToken.balanceOf(user1.address)).to.equal(user1Amount);
    });
  });
});
