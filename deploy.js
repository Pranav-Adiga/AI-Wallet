const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const AgentWallet = await hre.ethers.getContractFactory("AgentWallet");
  const wallet = await AgentWallet.deploy(deployer.address, hre.ethers.parseEther("1")); // 1 ETH daily limit

  await wallet.waitForDeployment();
  console.log("✅ AgentWallet deployed at:", wallet.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
