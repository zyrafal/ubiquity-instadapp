import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
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
    deployer: { default: 0 },
    tester: { default: 1 },
    uadWhale: "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd",
    ethWhale: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  },
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
        blockNumber: 13165306
      },
      accounts: [
        {
          privateKey: process.env.PRIVATE_KEY_1 ? process.env.PRIVATE_KEY_1 : "",
          balance: "1000000000000000000000"
        }
      ]
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
    },
    local: {
      chainId: 1,
      url: "http://127.0.0.1:8545",
      accounts
    },
    tenderly: {
      chainId: 1,
      url: `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_ID}`,
      accounts,
      initialBaseFeePerGas: 0
    }
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
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
