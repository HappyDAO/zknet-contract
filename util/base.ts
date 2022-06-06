import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { ethers } from "ethers";
import * as fs from "fs";
import * as hre from "hardhat";
import { Artifacts } from "hardhat/internal/artifacts";
import { resolve } from "path";
import * as zksync from "zksync-web3";

export const ETH_ADDRESS = zksync.utils.ETH_ADDRESS;

export const zknetEnv = process.env.ZKNET_ENV == undefined ? "local" : process.env.ZKNET_ENV;

export class BaseRuntime {
  public providerL2: zksync.Provider;
  public providerL1: ethers.providers.Provider;
  public artifactsL1: Artifacts;
  public wallets: zksync.Wallet[];
  public deployWallet: zksync.Wallet;

  constructor() {
    this.providerL1 = ethers.getDefaultProvider(process.env.ETH_NETWORK);
    this.providerL2 = new zksync.Provider(process.env.ZKSYNC_NETWORK);
    this.artifactsL1 = new Artifacts("artifacts");
    [this.deployWallet, ...this.wallets] = readWallets(this.providerL2, this.providerL1);
  }

  public async prepareL1Wallet(ethAmount: string, l1PrivateKey?: string): Promise<ethers.Wallet> {
    let randWallet: ethers.Wallet;
    if (l1PrivateKey) {
      randWallet = new ethers.Wallet(l1PrivateKey);
    } else {
      randWallet = ethers.Wallet.createRandom();
    }
    randWallet = randWallet.connect(this.providerL1);

    const fromWallet = this.deployWallet.ethWallet();

    const nonce = await fromWallet.getTransactionCount();
    const gasPrice = await this.providerL1.getGasPrice();
    // transfer eth
    await (
      await fromWallet.sendTransaction({
        nonce: nonce,
        gasLimit: 21000,
        gasPrice: gasPrice,
        to: randWallet.address,
        value: ethers.utils.parseEther(ethAmount),
      })
    ).wait();

    return randWallet;
  }

  public async prepareL2Wallet(ethAmount: string, l1PrivateKey?: string): Promise<zksync.Wallet> {
    let randWallet: zksync.Wallet;
    if (l1PrivateKey) {
      randWallet = new zksync.Wallet(l1PrivateKey);
    } else {
      randWallet = zksync.Wallet.createRandom();
    }
    randWallet = randWallet.connect(this.providerL2).connectToL1(this.providerL1);

    // deposit eth to l2 (ETH is an ERC20 token)
    await (
      await this.deployWallet.deposit({
        to: randWallet.address,
        token: ETH_ADDRESS,
        amount: ethers.utils.parseEther(ethAmount),
        approveERC20: true,
      })
    ).wait();

    return randWallet;
  }

  public async deployL1Contract(
    contractName: string,
    constructorArguments: any[] = [],
    deployWallet?: ethers.Wallet,
  ): Promise<ethers.Contract> {
    if (deployWallet == undefined) {
      deployWallet = this.deployWallet.ethWallet();
    }
    const artifact = this.artifactsL1.readArtifactSync(contractName);
    const contractFactory = await hre.ethers.getContractFactoryFromArtifact(artifact);
    const contract = await contractFactory.connect(deployWallet).deploy(...constructorArguments);
    await contract.deployed();
    return contract;
  }

  public async deployL2Contract(
    contractName: string,
    constructorArguments: any[] = [],
    deployWallet?: zksync.Wallet,
  ): Promise<zksync.Contract> {
    if (deployWallet == undefined) {
      deployWallet = this.deployWallet;
    }
    const deployer = new Deployer(hre, deployWallet);
    const artifact = await deployer.loadArtifact(contractName);
    return await deployer.deploy(artifact, constructorArguments);
  }

  public async connectL1Contract(contractName: string, contractAddress: string): Promise<ethers.Contract> {
    const artifact = this.artifactsL1.readArtifactSync(contractName);
    return new ethers.Contract(contractAddress, artifact.abi);
  }

  public async connectL2Contract(contractName: string, contractAddress: string): Promise<zksync.Contract> {
    const deployer = new Deployer(hre, this.deployWallet);
    const artifact = await deployer.loadArtifact(contractName);
    return new zksync.Contract(contractAddress, artifact.abi);
  }

  /**
   * get abi for contract
   * @param contractName name of the related contract
   * @param artifactsPath abi related artifacts stored path
   */
  public getABI(contractName: string, artifactsPath: string): any[] {
    const artifacts = new Artifacts(artifactsPath);
    const artifact = artifacts.readArtifactSync(contractName);
    return artifact.abi;
  }
}

interface WalletInfo {
  address: string;
  privateKey: string;
}

function readWallets(l2Provider: zksync.Provider, l1Provider: ethers.providers.Provider): zksync.Wallet[] {
  const walletsPath = resolve(__dirname, `./wallets/${zknetEnv}.json`);
  const walletInfos: WalletInfo[] = JSON.parse(fs.readFileSync(walletsPath, "utf8"));
  const wallets: zksync.Wallet[] = [];
  walletInfos.forEach(walletInfo => {
    const wallet: zksync.Wallet = new zksync.Wallet(walletInfo.privateKey, l2Provider, l1Provider);
    wallets.push(wallet);
  });
  return wallets;
}
