import * as fs from "fs";
import * as hre from "hardhat";
import * as zksync from "zksync-web3";
import { ethers } from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { erc20ABI } from "./erc20.abi";
import { Logger } from "tslog";
import { Artifacts } from "hardhat/internal/artifacts";

// some account (PubKey -> privKey) pairs
const LOCAL_WALLETS_PATH = "test/data/local-wallets.json";
const GOERLI_WALLETS_PATH = "test/data/goerli-wallets.json";

// default erc20 and eth address
const ERC20_ADDRESS = "0x3fad2b2e21ea1c96618cc76a42fb5a77c3f71c6f";
const ETH_ADDRESS = zksync.utils.ETH_ADDRESS;

const log: Logger = new Logger({ name: "zknetLogger" });

// todo: what is this?
const ETH_ID = 0;
const ERC20_ID = 1;

interface WalletInfo {
  address: string;
  privateKey: string;
}

class ZKNet {
  // 1. eth and zksync providers
  zksyncProvider: zksync.Provider;
  ethProvider: ethers.providers.Provider;
  // 2. predefined wallets
  adminWallet: zksync.Wallet;
  normalWallets: zksync.Wallet[];
  // 3. predefined contract
  erc20L1: ethers.Contract;
  erc20L2: zksync.Contract;
  ethL2: zksync.Contract;

  constructor() {
    // 1. init the providers

    log.info("construct the providers");
    this.ethProvider = ethers.getDefaultProvider(
      hre.userConfig.zkSyncDeploy?.ethNetwork
    );
    this.zksyncProvider = zksync.Provider.getDefaultProvider();

    log.info("load wallet key infos");
    // 2. load wallet key info
    [this.adminWallet, ...this.normalWallets] = this.readWallets(
      this.zksyncProvider,
      this.ethProvider
    );

    // 3. init predefined contract
    log.info("construct predefined contracts");
    this.erc20L1 = new ethers.Contract(
      ERC20_ADDRESS,
      erc20ABI,
      this.ethProvider
    );
    this.erc20L2 = new zksync.Contract(
      ERC20_ADDRESS,
      erc20ABI,
      this.zksyncProvider
    );

    this.ethL2 = new zksync.Contract(
      ETH_ADDRESS,
      erc20ABI,
      this.zksyncProvider
    );
  }

  async init() {}

  /**
   * deploy contract to zksync network
   * @param wallet
   * @param contractName
   * @param contractArguments
   */
  async deployContractToZksync(
    wallet: zksync.Wallet,
    contractName: string,
    contractArguments: any[]
  ): Promise<zksync.Contract> {
    const deployer = new Deployer(hre, wallet);
    const contractArtifact = await deployer.loadArtifact(contractName);
    return await deployer.deploy(contractArtifact, contractArguments);
  }

  /**
   * deploy contract to Ethereum
   * @param wallet zkSync wallet which wrapped an ether's wallet
   * @param contractName name of contract
   * @param contractArguments arguments of contract constructor
   */
  async deployContractToEthereum(
    wallet: zksync.Wallet,
    contractName: string,
    contractArguments: any[]
  ): Promise<ethers.Contract> {
    const artifacts = new Artifacts("artifacts");
    const factoryArtifact = artifacts.readArtifactSync(contractName);
    const factory = await hre.ethers.getContractFactoryFromArtifact(
      factoryArtifact,
      wallet.ethWallet()
    );
    const instance = await factory.deploy(contractArguments);

    await instance.deployed();
    log.info(`contract deployed: ${instance.address}`);
    return instance;
  }

  readWallets(
    zksyncProvider: zksync.Provider,
    ethProvider: ethers.providers.Provider
  ): zksync.Wallet[] {
    const walletsPath =
      process.env.NODE_ENV === "local"
        ? LOCAL_WALLETS_PATH
        : GOERLI_WALLETS_PATH;
    const walletInfos: WalletInfo[] = JSON.parse(
      fs.readFileSync(walletsPath, "utf8")
    );
    const wallets: zksync.Wallet[] = [];
    walletInfos.forEach((walletInfo) => {
      const wallet: zksync.Wallet = new zksync.Wallet(
        walletInfo.privateKey,
        zksyncProvider,
        ethProvider
      );
      wallets.push(wallet);
    });
    return wallets;
  }

  async prepareWallet(
    ethAmount: string,
    erc20Amount?: string
  ): Promise<zksync.Wallet> {
    const randWallet = zksync.Wallet.createRandom()
      .connect(this.zksyncProvider)
      .connectToL1(this.ethProvider);

    // deposit eth to l2 (ETH is an ERC20 token)
    await (
      await this.adminWallet.deposit({
        to: randWallet.address,
        token: ETH_ADDRESS,
        amount: ethers.utils.parseEther(ethAmount),
        approveERC20: true,
      })
    ).wait();

    if (erc20Amount !== undefined) {
      // deposit erc20 to l2
      await (
        await this.adminWallet.deposit({
          to: randWallet.address,
          token: ERC20_ADDRESS,
          amount: erc20Amount,
          approveERC20: true,
        })
      ).wait();
    }

    return randWallet;
  }
}

export { ZKNet, log };
