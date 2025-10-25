require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const ALCHEMY_API = process.env.RPC_URL || '';
module.exports = {
  solidity: '0.8.20',
  networks: {
    sepolia: {
      url: ALCHEMY_API,
      // account private key left for .env in relayer/agent - for deploy use HARDHAT_DEPLOYER_PRIVATE_KEY
      accounts: process.env.HARDHAT_DEPLOYER_PRIVATE_KEY ? [process.env.HARDHAT_DEPLOYER_PRIVATE_KEY] : []
    }
  }
};
