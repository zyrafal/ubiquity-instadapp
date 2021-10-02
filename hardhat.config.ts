import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";

import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";

import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/index";

import dotenv from "dotenv";
dotenv.config();
if (!process.env.ALCHEMY_ID) {
  throw new Error("ENV variables not set!");
}
const accounts = [
  process.env.PRIVATE_KEY_1 || "",
  process.env.PRIVATE_KEY_2 || "",
  process.env.PRIVATE_KEY_3 || "",
  process.env.PRIVATE_KEY_4 || "",
  process.env.PRIVATE_KEY_5 || ""
];

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: { default: 0 }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
        blockNumber: 13100000
      },
      accounts: [
        {
          privateKey: process.env.PRIVATE_KEY_1 ? process.env.PRIVATE_KEY_1 : "",
          balance: "1000000000000000000000"
        }
      ],
      initialBaseFeePerGas: 0
    },
    mainnet: {
      chainId: 1,
      // url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
      accounts
    },
    rinkeby: {
      chainId: 4,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    },
    ropsten: {
      chainId: 3,
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  typechain: {
    outDir: "artifacts/types",
    target: "ethers-v5"
  },
  paths: {
    sources: "contracts",
    deploy: "deploy",
    deployments: "deployments",
    tests: "tests",
    imports: "lib",
    cache: "artifacts/cache",
    artifacts: "artifacts"
  },
  mocha: {
    timeout: 1000000
  }
};

export default config;
