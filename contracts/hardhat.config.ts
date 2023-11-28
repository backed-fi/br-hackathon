import { HardhatUserConfig } from "hardhat/config";

import 'dotenv/config';
import '@typechain/hardhat';
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      "outputSelection": {
        "*": {
          "*": [
            "opcodes",
            "metadata", // <--
            "evm.bytecode",
            "evm.bytecode.sourceMap"
          ],
        }
      }
    }
  },
  networks: {
    hardhat: {
      forking: { url: 'https://endpoints.omniatech.io/v1/eth/sepolia/public	'},
      allowUnlimitedContractSize: true
    },
    localhost: {
      url: 'http://localhost:8545'
    },
    sepolia: {
      url: 'https://endpoints.omniatech.io/v1/eth/sepolia/public',
      accounts: [process.env.SEPOLIA_PK!]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PK!]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: './contracts',
    artifacts: `./artifacts`,
    cache: `./cache`
  },
  typechain: {
    outDir: `./../frontend/src/typechain`,
    target: 'ethers-v5',
    alwaysGenerateOverloads: true
  },
};

export default config;
