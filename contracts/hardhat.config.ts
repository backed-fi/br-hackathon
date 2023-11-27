import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-chai-matchers";
import 'dotenv/config';
import "@nomicfoundation/hardhat-toolbox";

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
  }
};

export default config;
