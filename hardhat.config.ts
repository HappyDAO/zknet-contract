import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-waffle";
import "@primitivefi/hardhat-dodoc";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
import { resolve } from "path";

const zknetEnv = process.env.ZKNET_ENV == undefined ? "local" : process.env.ZKNET_ENV;

dotenv.config({ path: resolve(__dirname, "./env/.env." + zknetEnv) });

let defaultNetwork = "l2";
let contractSource = "./contracts";
let typechainOutDir = "typechain-l2";
switch (process.env.COMPILE_TARGET) {
  case "l1":
    contractSource += "/l1";
    defaultNetwork = "l1";
    typechainOutDir = "typechain-l1";
    break;
  case "l2":
    contractSource += "/l2";
    break;
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
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
    hardhat: {},
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
    only: [":Perpetual$", ":Governance$", ":IERC20$"],
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
    outDir: typechainOutDir,
    target: "ethers-v5",
  },
  mocha: {
    timeout: 100000000,
  },
};

export default config;
