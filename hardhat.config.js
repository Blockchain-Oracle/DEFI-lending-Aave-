require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();
const PRIVATEKEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.RPC_URL;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY;
const coinmarketApiKey = process.env.COINMARKET_APIKEY;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      chainId: 31337,
    },
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    sepolia: {
      chainId: 11155111,
      accounts: PRIVATEKEY !== "undefined" ? [PRIVATEKEY] : "",
      url: SEPOLIA_RPC_URL !== "undefined" ? SEPOLIA_RPC_URL : "",
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.20" },
      {
        version: "0.4.20",
      },
      { version: "0.6.7" },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY !== "undefined" ? ETHERSCAN_APIKEY : "",
  },
  gasReporter: {
    coinmarketcap: coinmarketApiKey !== "undefined" ? coinmarketApiKey : "",
    enabled: false,
    token: "ETH",
    noColors: true,
    outputFile: "report.txt",
    currency: "USD",
  },
  mocha: {
    timeout: "300000000",
  },
};
