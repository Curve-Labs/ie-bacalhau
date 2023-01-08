import { task, types } from "hardhat/config";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

task("test:setup", "Deploys a new instance of Shrine")
  .addOptionalParam(
    "ipfs",
    "Ipfs hash that points to airdrop specification",
    undefined,
    types.string
  )
  .setAction(async ({ ipfs }, { ethers, run }) => {
    const [deployer] = await ethers.getSigners();

    const values = [
      [deployer.address, "50"],
      ["0x968cAe0F1c1FD20FffF23f4C7A7208280c9Cc20b", "50"],
    ];
    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

    const totalShares = 100;
    const amount = 100;
    const shrine = await run("shrine:setup", {
      avatar: deployer.address,
      ipfs: ipfs || "abc",
      root: tree.root,
      shares: totalShares,
    });

    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy("abc", "def");
    await testToken.mint(deployer.address, amount);
    await testToken.approve(shrine.address, amount);
    await shrine.offer(testToken.address, amount);

    console.log("Shrine address: ", shrine.address);
    console.log("Token address: ", testToken.address);
    console.log("Tree root: ", tree.root);
    console.log(
      "Initial balance U1: ",
      await testToken.balanceOf(deployer.address)
    );
  });
