import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {} from "@gnosis.pm/zodiac";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("Airdrop", function () {
  let deployer: SignerWithAddress;
  let testAvatar: Contract, reality: Contract;

  async function deployFixture() {
    const [deployer] = await ethers.getSigners();

    const TestAvatar = await ethers.getContractFactory("TestAvatar");
    const testAvatar = await TestAvatar.deploy();

    const Mock = await ethers.getContractFactory("MockContract");
    const mock = await Mock.deploy();

    const oracle = await ethers.getContractAt("RealitioV3ETH", mock.address);

    const timeout = 42;
    const cooldown = 23;
    const expiration = 0;
    const bond = 0;
    const templateId = 1337;

    const Reality = await ethers.getContractFactory("RealityModuleETH");
    const reality = await Reality.deploy(
      deployer.address,
      testAvatar.address,
      testAvatar.address,
      oracle.address,
      timeout,
      cooldown,
      expiration,
      bond,
      templateId,
      mock.address
    );

    await testAvatar.enableModule(reality.address);

    return { deployer, testAvatar, reality };
  }

  it("bla", async () => {
    await loadFixture(deployFixture);
  });
});
