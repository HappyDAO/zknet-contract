import * as fs from "fs";
import { log } from "console";

import { expect } from "chai";
import * as hre from "hardhat";
import * as zksync from "zksync-web3";
import { ethers } from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { erc20ABI } from "./erc20.abi";

const LOCAL_WALLETS_PATH = "test/data/local-wallets.json";
const GOERLI_WALLETS_PATH = "test/data/goerli-wallets.json";
const ERC20_ADDRESS = "0x3fad2b2e21ea1c96618cc76a42fb5a77c3f71c6f";
const ETH_ADDRESS = zksync.utils.ETH_ADDRESS;
const ETH_ID = 0;
const ERC20_ID = 1;

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
  let ethL2: zksync.Contract;
  let providerL2: zksync.Provider;
  let providerL1: ethers.providers.Provider;

  async function init() {
    providerL1 = ethers.getDefaultProvider(
      hre.userConfig.zkSyncDeploy?.ethNetwork
    );
    erc20L1 = new ethers.Contract(ERC20_ADDRESS, erc20ABI, providerL1);
    providerL2 = zksync.Provider.getDefaultProvider();
    erc20L2 = new zksync.Contract(ERC20_ADDRESS, erc20ABI, providerL2);
    ethL2 = new zksync.Contract(ETH_ADDRESS, erc20ABI, providerL2);

    [deployWallet, ...wallets] = readWallets(providerL2, providerL1);
    perpetual = await deployPerpetual(deployWallet);

    const registerETHTx = await perpetual.registerToken(ETH_ADDRESS, ETH_ID);
    registerETHTx.wait();

    const registerERC20Tx = await perpetual.registerToken(
      ERC20_ADDRESS,
      ERC20_ID
    );
    registerERC20Tx.wait();
  }

  async function prepareWallet(
    ethAmount: string,
    erc20Amount?: string
  ): Promise<zksync.Wallet> {
    const randWallet = zksync.Wallet.createRandom()
      .connect(providerL2)
      .connectToL1(providerL1);

    // deposit eth to l2 (ETH is an ERC20 token)
    await (
      await deployWallet.deposit({
        to: randWallet.address,
        token: ETH_ADDRESS,
        amount: ethers.utils.parseEther(ethAmount),
        approveERC20: true,
      })
    ).wait();

    if (erc20Amount !== undefined) {
      // deposit erc20 to l2
      await (
        await deployWallet.deposit({
          to: randWallet.address,
          token: ERC20_ADDRESS,
          amount: erc20Amount,
          approveERC20: true,
        })
      ).wait();
    }

    return randWallet;
  }

  beforeEach(init);

  it("test vault", async function () {
    log("prepare test wallets");
    const randWallet1 = await prepareWallet("110", "100");
    const randWallet2 = await prepareWallet("110");

    log("approve l2 eth");
    await (
      await ethL2.connect(randWallet1).approve(perpetual.address, 100)
    ).wait();

    log("approve l2 erc20");
    await (
      await erc20L2.connect(randWallet1).approve(perpetual.address, 100)
    ).wait();

    log("deposit eth to zknet");
    await (await perpetual.connect(randWallet1).deposit(ETH_ID, 100)).wait();
    expect(await perpetual.connect(randWallet1).balance(ETH_ID)).to.equal(100);

    log("deposit erc20 to zknet");
    await (await perpetual.connect(randWallet1).deposit(ERC20_ID, 100)).wait();
    expect(await perpetual.connect(randWallet1).balance(ERC20_ID)).to.equal(
      100
    );

    log("transfer");
    await (
      await perpetual
        .connect(randWallet1)
        .transfer(randWallet2.address, ERC20_ID, 50, 0)
    ).wait();
    expect(await perpetual.connect(randWallet1).balance(ERC20_ID)).to.equal(50);
    expect(await perpetual.connect(randWallet2).balance(ERC20_ID)).to.equal(50);

    log("deposit to position");
    const positionId1 = 1;
    const positionId2 = 2;
    const orderId1 = 1;
    const orderId2 = 2;
    await (
      await perpetual
        .connect(randWallet1)
        .positionDeposit(positionId1, ERC20_ID, 50)
    ).wait();
    await (
      await perpetual
        .connect(randWallet2)
        .positionDeposit(positionId2, ERC20_ID, 50)
    ).wait();
    expect(await perpetual.connect(randWallet1).balance(ERC20_ID)).to.equal(0);
    expect(await perpetual.connect(randWallet2).balance(ERC20_ID)).to.equal(0);

    log("settlement order");
    await (
      await perpetual.connect(deployWallet).settlement(
        {
          id: orderId1,
          trader: randWallet1.address,
          positionId: positionId1,
          positionToken: ERC20_ID,
          positionAmount: 100,
          fee: 1,
          timestamp: Math.floor(Date.now() / 1000),
          signature: [1, 2, 3],
        },
        {
          id: orderId2,
          trader: randWallet2.address,
          positionId: positionId2,
          positionToken: ERC20_ID,
          positionAmount: -100,
          fee: 1,
          timestamp: Math.floor(Date.now() / 1000),
          signature: [1, 2, 3],
        },
        {
          partAActualAmount: 100,
          partBActualAmount: -100,
          partAFee: 1,
          partBFee: 1,
        }
      )
    ).wait();

    log("withdraw position");
    await (
      await perpetual
        .connect(randWallet1)
        .positionWithdraw(positionId1, ERC20_ID, 50)
    ).wait();
    await (
      await perpetual
        .connect(randWallet2)
        .positionWithdraw(positionId2, ERC20_ID, 50)
    ).wait();
    expect(await perpetual.connect(randWallet1).balance(ERC20_ID)).to.equal(50);
    expect(await perpetual.connect(randWallet2).balance(ERC20_ID)).to.equal(50);

    log("withdraw erc20");
    await (await perpetual.connect(randWallet1).withdraw(ERC20_ID, 50)).wait();
    expect(await perpetual.connect(randWallet1).balance(ERC20_ID)).to.equal(0);
    expect(await randWallet1.getBalance(ERC20_ADDRESS)).to.equal(50);

    log("withdraw eth");
    await (await perpetual.connect(randWallet1).withdraw(ETH_ID, 100)).wait();
    expect(await perpetual.connect(randWallet1).balance(ETH_ID)).to.equal(0);
  });
});
