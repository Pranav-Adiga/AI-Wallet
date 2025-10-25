const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentWallet", function () {
  it("deploys and sets owner", async function () {
    const [deployer] = await ethers.getSigners();
    const AgentWallet = await ethers.getContractFactory("AgentWallet");
    const wallet = await AgentWallet.deploy(deployer.address, ethers.parseEther("1"));
    await wallet.waitForDeployment();
    expect(await wallet.owner()).to.equal(deployer.address);
  });
});
