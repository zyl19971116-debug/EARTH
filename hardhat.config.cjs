/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

const privateKey = process.env.ROBINHOOD_DEPLOYER_PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache-hardhat",
  },
  networks: {
    hardhat: { chainId: 46630 },
    robinhood: {
      url: process.env.ROBINHOOD_RPC_URL || "https://rpc.mainnet.chain.robinhood.com",
      chainId: 4663,
      accounts: privateKey ? [privateKey] : [],
    },
  },
};
