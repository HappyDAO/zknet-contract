import * as fs from "fs";

import { expect } from "chai";
import * as hre from "hardhat";
import * as zksync from "zksync-web3";
import { BigNumberish, ethers } from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { erc20ABI } from "./erc20.abi";

const LOCAL_WALLETS_PATH = "test/data/local-wallets.json";
const GOERLI_WALLETS_PATH = "test/data/goerli-wallets.json";
const ERC20_ADDRESS = "0x3fad2b2e21ea1c96618cc76a42fb5a77c3f71c6f";

interface WalletInfo {
  address: string;
  privateKey: string;
}

function readWallets(
  l2Provider: zksync.Provider,
  l1Provider: ethers.providers.Provider
): zksync.Wallet[] {
  const walletsPath =
    process.env.NODE_ENV == "local" ? LOCAL_WALLETS_PATH : GOERLI_WALLETS_PATH;
  let walletInfos: WalletInfo[] = JSON.parse(
    fs.readFileSync(walletsPath, "utf8")
  );
  let wallets: zksync.Wallet[] = [];
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

async function deployPerpetual(
  wallet: zksync.Wallet
): Promise<zksync.Contract> {
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Perpetual");
  return await deployer.deploy(artifact, []);
}

describe("Perpetual", function () {
  let perpetual: zksync.Contract;
  let deployWallet: zksync.Wallet;
  let wallets: zksync.Wallet[];
  let erc20L1: ethers.Contract;
  let erc20L2: zksync.Contract;
  let providerL2: zksync.Provider;
  let providerL1: ethers.providers.Provider;

  async function init() {
    providerL1 = ethers.getDefaultProvider(
      hre.userConfig.zkSyncDeploy?.ethNetwork
    );
    erc20L1 = new ethers.Contract(ERC20_ADDRESS, erc20ABI, providerL1);
    providerL2 = zksync.Provider.getDefaultProvider();
    erc20L2 = new zksync.Contract(ERC20_ADDRESS, erc20ABI, providerL2);

    [deployWallet, ...wallets] = readWallets(providerL2, providerL1);
    perpetual = await deployPerpetual(deployWallet);
  }

  async function prepareWallet(amount: BigNumberish): Promise<zksync.Wallet> {
    const randWallet = zksync.Wallet.createRandom()
      .connect(providerL2)
      .connectToL1(providerL1);

    const nonce = await deployWallet.ethWallet().getTransactionCount();
    const gasPrice = await providerL1.getGasPrice();

    const sendETHTx = await deployWallet.ethWallet().sendTransaction({
      nonce: nonce,
      gasLimit: 21000,
      gasPrice: gasPrice,
      to: randWallet.address,
      value: ethers.utils.parseEther("105"),
      data: "",
    });
    await sendETHTx.wait();

    const transferTx = await erc20L1
      .connect(deployWallet.ethWallet())
      .transfer(randWallet.address, 100);
    await transferTx.wait();

    return randWallet;
  }

  beforeEach(init);

  it("test vault", async function () {
    const randWallet = await prepareWallet(100);

    const ethDepositTx = await randWallet.deposit({
      token: zksync.utils.ETH_ADDRESS,
      amount: ethers.utils.parseEther("100"),
      approveERC20: true,
    });
    await ethDepositTx.wait();

    const erc20DepositTx = await randWallet.deposit({
      token: ERC20_ADDRESS,
      amount: 100,
      approveERC20: true,
    });
    await erc20DepositTx.wait();

    const approveTx = await erc20L2
      .connect(randWallet)
      .approve(perpetual.address, 100);
    await approveTx.wait();

    const depositTx = await perpetual
      .connect(randWallet)
      .deposit(ERC20_ADDRESS, 100);
    await depositTx.wait();

    expect(await perpetual.connect(randWallet).balance(ERC20_ADDRESS)).to.equal(
      100
    );

    const withdrawTx = await perpetual
      .connect(randWallet)
      .withdraw(ERC20_ADDRESS, 100);
    await withdrawTx.wait();

    expect(await perpetual.connect(randWallet).balance(ERC20_ADDRESS)).to.equal(
      0
    );

    expect(await randWallet.getBalance(ERC20_ADDRESS)).to.equal(100);
  });
});
