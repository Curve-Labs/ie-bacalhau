import path from "path";
import { promises } from "fs";

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
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

    console.log(RealityEth);
    const realityEth = await RealityEth.deploy();

    const Shrine = await ethers.getContractFactory("Shrine");
    const shrine = await Shrine.deploy();

    return {
      deployer,
      testAvatar,
      shrine,
      testToken,
      realityEth,
      mock,
    };
  }

  before(
    "deploy test contracts: testAvatar (= Safe), testToken, realitio, shrine, mock",
    async () => {
      ({ deployer, testAvatar, shrine, testToken, realityEth, mock } =
        await loadFixture(deployFixture));
    }
  );

  describe("configuring the components", () => {
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

  describe("proposing a merkle drop", async () => {
    it("calls askQuestionWithMinBond with correct data", async () => {
      // const id = "some_random_id";
      // const txHash = ethers.utils.solidityKeccak256(
      //   ["string"],
      //   ["some_tx_data"]
      // );
      // const question = await reality.buildQuestion(id, [txHash]);
      // const questionId = await reality.getQuestionId(question, 0);
      // const questionHash = ethers.utils.keccak256(
      //   ethers.utils.toUtf8Bytes(question)
      // );
      // await mock.givenMethodReturnUint(
      //   realitio.interface.getSighash("askQuestionWithMinBond"),
      //   questionId
      // );
      // await expect(reality.addProposal(id, [txHash]))
      //   .to.emit(module, "ProposalQuestionCreated")
      //   .withArgs(questionId, id);
      // expect(await reality.questionIds(questionHash)).to.be.deep.equals(
      //   questionId
      // );
      // const askQuestionCalldata = realitio.interface.encodeFunctionData(
      //   "askQuestionWithMinBond",
      //   [1337, question, realitio.address, 42, 0, 0, 0]
      // );
      // expect(
      //   (
      //     await mock.callStatic.invocationCountForCalldata(askQuestionCalldata)
      //   ).toNumber()
      // ).to.be.equals(1);
      // expect((await mock.callStatic.invocationCount()).toNumber()).to.be.equals(
      //   1
      // );
    });
  });
});
