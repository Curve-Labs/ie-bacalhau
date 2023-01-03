import path from "path";
import { promises } from "fs";

import { expect } from "chai";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractReceipt, PopulatedTransaction } from "ethers";
import template from "../tasks/defaultTemplate.json";
import realityEthAbi from "../../../node_modules/@reality.eth/contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json";

describe("Airdrop", function () {
  let deployer: SignerWithAddress;
  let testAvatar: Contract,
    realityModule: Contract,
    shrine: Contract,
    mock: Contract,
    testToken: Contract,
    realityEth: Contract,
    templateId: string;

  const timeout = 42;
  const cooldown = 23;
  const expiration = 0;
  const bond = "0";

  async function deployFixture() {
    const [deployer] = await ethers.getSigners();

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
      testAvatar,
      testToken,
      realityEth,
      mock,
    };
  }

  before(
    "deploy test contracts: testAvatar (= Safe), testToken, realitio, shrine, mock",
    async () => {
      ({ deployer, testAvatar, testToken, realityEth, mock } =
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
      await testAvatar.enableModule(realityModule.address);
    });
  });

  describe("initiating a merkle drop", () => {
    const amount = 100;
    const proposalId = ethers.utils.hexZeroPad("0x01", 32);
    const ipfsHash = "example_ipfs";

    let txHashes: string[], txs: PopulatedTransaction[], questionId: string;

    it("deploys a Shrine contract with the avatar as owner", async () => {
      shrine = await run("shrine:setup", { avatar: testAvatar.address });

      expect(await shrine.owner()).to.equal(testAvatar.address);
    });

    it("adds the proposal to reality.eth", async () => {
      const taskResult = await run("reality:propose", {
        oracle: realityEth.address,
        module: realityModule.address,
        token: testToken.address,
        amount,
        id: proposalId,
        root: ethers.constants.HashZero,
        shrine: shrine.address,
        ipfs: ipfsHash,
      });

      const { tx } = taskResult;
      txHashes = taskResult.txHashes;
      txs = taskResult.txs;

      await expect(tx).to.emit(realityModule, "ProposalQuestionCreated");

      // listen to event and store questionId
      const receipt: ContractReceipt = await tx.wait();
      const event = receipt.events?.find(
        (log) => log.event === "ProposalQuestionCreated"
      );
      event && event.args && (questionId = event.args[0]);
    });

    context("when the proposal has become executable", async () => {
      const trueAsBytes32 = ethers.utils.hexZeroPad(
        ethers.utils.hexlify(1),
        32
      );

      before("finalize answer on reality eth", async () => {
        await realityEth.submitAnswer(questionId, trueAsBytes32, 0, {
          value: 1000,
        });
        await mine(69); // timetravel into the future
      });

      describe("tx1: approving token spend", () => {
        const index = 0;

        it("sets the correct token allowance", async () => {
          await realityModule.executeProposal(
            proposalId,
            txHashes,
            txs[index].to,
            0,
            txs[index].data,
            0
          );

          expect(
            await testToken.allowance(testAvatar.address, shrine.address)
          ).to.equal(amount);
        });
      });

      describe("tx2: update shrine ledger", () => {
        const index = 1;

        it("increments the ledger version", async () => {
          await realityModule.executeProposalWithIndex(
            proposalId,
            txHashes,
            txs[index].to,
            0,
            txs[index].data,
            0,
            index
          );

          expect(await shrine.currentLedgerVersion()).to.equal(2);
        });
      });

      describe("tx3: update ledger metadata", () => {
        const index = 2;

        it("emits an event that contains new metadata", async () => {
          await expect(
            realityModule.executeProposalWithIndex(
              proposalId,
              txHashes,
              txs[index].to,
              0,
              txs[index].data,
              0,
              index
            )
          )
            .to.emit(shrine, "UpdateLedgerMetadata")
            .withArgs(2, ipfsHash);
        });
      });

      describe("tx4: offer token to shrine", () => {
        const index = 3;

        it("emits the event 'Offer'", async () => {
          await expect(
            realityModule.executeProposalWithIndex(
              proposalId,
              txHashes,
              txs[index].to,
              0,
              txs[index].data,
              0,
              index
            )
          )
            .to.emit(shrine, "Offer")
            .withArgs(testAvatar.address, testToken.address, amount);
        });
      });
    });
  });

  describe("claiming a merkle drop", () => {});
});
