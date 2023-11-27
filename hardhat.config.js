// @ts-nocheck
require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.ankr.com/eth_goerli",
        blockNumber: 10105047
      }
    },
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [process.env.GOERLI_PRIVATE_KEY],
      chainId: 5,
    },
  },
  mocha: {
    timeout: 100000000
  }
};

