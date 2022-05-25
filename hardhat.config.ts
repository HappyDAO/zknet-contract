import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "hardhat-abi-exporter";
import "@primitivefi/hardhat-dodoc";
import { resolve } from "path";

const zknetEnv = process.env.ZKNET_ENV == undefined ? "local" : process.env.ZKNET_ENV;

let defaultNetwork = "l2";
let contractSource = "./contracts";

dotenv.config({ path: resolve(__dirname, "./env/.env." + zknetEnv) });

switch (process.env.COMPILE_TARGET) {
  case "l1":
    contractSource += "/l1";
    defaultNetwork = "l1";
    break;
  case "l2":
    contractSource += "/l2";
    break;
}

const config: HardhatUserConfig = {
  defaultNetwork: defaultNetwork,
  zksolc: {
    version: "0.1.0",
    compilerSource: "docker",
    settings: {
      compilerPath: "zksolc",
      optimizer: {
        enabled: true,
      },
      experimental: {
        dockerImage: "matterlabs/zksolc",
      },
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: process.env.ZKSYNC_NETWORK,
    ethNetwork: process.env.ETH_NETWORK,
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  paths: {
    sources: contractSource,
  },
  networks: {
    l1: {
      zksync: false,
      url: process.env.ETH_NETWORK,
    },
    l2: {
      zksync: true,
      url: process.env.ZKSYNC_NETWORK,
    },
  },
  gasReporter: {
    enabled: process.env.ENABLE_REPORT_GAS === "true",
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: false,
    clear: true,
    flat: true,
    only: [":Perpetual$", ":Governance$"],
    spacing: 2,
    pretty: true,
  },
  dodoc: {
    runOnCompile: false,
    outputDir: "./docs",
    keepFileStructure: true,
    freshOutput: true,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
