import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
// import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";

import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";

import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/index";

import dotenv from "dotenv";
import { resolve } from "path";

if (!process.env.ALCHEMY_API_KEY) {
  dotenv.config({ path: resolve(__dirname, "../.env") });
  if (!process.env.ALCHEMY_API_KEY) {
    throw new Error("ENV Variable ALCHEMY_API_KEY not set!");
  }
}

const accounts = [process.env.PRIVATE_KEY_1 || "", process.env.PRIVATE_KEY_2 || ""];

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: { default: 0 },
    signer: { default: 0 },
    tester: process.env.PUBLIC_KEY || "",
    uadWhale: "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd",
    ethWhale: "0x1b3cB81E51011b549d78bf720b0d924ac763A7C2",
    daiWhale: "0x82810e81CAD10B8032D39758C8DBa3bA47Ad7092"
  },
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 13800000  // InstaIndex set UBIQUITY-A connector 13779456
        // blockNumber: 13601000 // connector block deploy = 13600952 
        // blockNumber: 13100000 // old block, old instaIndex, not using deployed connector 
      },
      accounts: [
        {
          privateKey: process.env.PRIVATE_KEY_1 ? process.env.PRIVATE_KEY_1 : "",
          balance: "1000000000000000000000"
        },
        {
          privateKey: process.env.PRIVATE_KEY_2 ? process.env.PRIVATE_KEY_2 : "",
          balance: "1000000000000000000000"
        }
      ]
    },
    mainnet: {
      chainId: 1,
      // url: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts
    },
    rinkeby: {
      chainId: 4,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`,
      accounts
    },
    ropsten: {
      chainId: 3,
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
      accounts
    },
    localhost: {
      chainId: 1,
      saveDeployments: false,
      url: "http://127.0.0.1:8545",
      accounts,
    },
    tenderly: {
      chainId: 1,
      url: `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`,
      accounts,
      initialBaseFeePerGas: 0
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4"
      },
      {
        version: "0.7.6"
      },
      {
        version: "0.6.12"
      }
    ],
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
    timeout: 1000000,
    bail: true
  }
};

export default config;
