import * as fs from "fs";
import * as hre from "hardhat";
import * as zksync from "zksync-web3";
import { ethers } from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { erc20ABI } from "./erc20.abi";
import { Logger } from "tslog";

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
  perpetual: zksync.Contract;
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

    this.perpetual = new zksync.Contract(
      ETH_ADDRESS,
      erc20ABI,
      this.zksyncProvider
    );
  }

  async init() {
    // 2. init predefined contract
    log.info("try to deploy perpetual contract");
    this.perpetual = await this.deployPerpetual(this.adminWallet);
    log.info("perpetual contract deployed, address: ", this.perpetual.address);

    const registerETHTx = await this.perpetual.registerToken(
      ETH_ADDRESS,
      ETH_ID
    );
    registerETHTx.wait();

    const registerERC20Tx = await this.perpetual.registerToken(
      ERC20_ADDRESS,
      ERC20_ID
    );
    registerERC20Tx.wait();
  }

  async deployPerpetual(wallet: zksync.Wallet): Promise<zksync.Contract> {
    return this.deployContractToZksync(wallet, "Perpetual", []);
  }

  async deployContractToZksync(
    wallet: zksync.Wallet,
    contractName: string,
    contractArguments: any[]
  ): Promise<zksync.Contract> {
    const deployer = new Deployer(hre, wallet);
    const contractArtifact = await deployer.loadArtifact(contractName);
    return await deployer.deploy(contractArtifact, contractArguments);
  }

  readWallets(
    l2Provider: zksync.Provider,
    l1Provider: ethers.providers.Provider
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
        l2Provider,
        l1Provider
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
