import { expect } from "chai";
import * as zksync from "zksync-web3";

import { IERC20, Perpetual } from "../../typechain-l2";
import { ETH_ADDRESS } from "../../util/base";
import { erc20ABI } from "../../util/erc20.abi";
import { logger } from "../../util/log";
import { ERC20_ADDRESS, PerpetualRuntime } from "../../util/perpetual";

const ETH_ID = 0;
const ERC20_ID = 1;

describe("Perpetual", function () {
  let perpetual: Perpetual;
  let runtime: PerpetualRuntime;
  let erc20L2: IERC20;
  let ethL2: IERC20;

  async function init() {
    logger.info("Init Perpetual");
    runtime = new PerpetualRuntime();
    erc20L2 = new zksync.Contract(ERC20_ADDRESS, erc20ABI, runtime.providerL2) as IERC20;
    ethL2 = new zksync.Contract(ETH_ADDRESS, erc20ABI, runtime.providerL2) as IERC20;
    perpetual = await runtime.deployPerpetual();

    await (await perpetual.registerToken(ETH_ADDRESS, ETH_ID)).wait();
    await (await perpetual.registerToken(ERC20_ADDRESS, ERC20_ID)).wait();
  }

  beforeEach(init);

  it("test vault", async function () {
    logger.info("Prepare test wallets");
    const randWallet1 = await runtime.prepareL2Wallet("110", "100");
    const randWallet2 = await runtime.prepareL2Wallet("110");

    logger.info("Approve l2 eth");
    await (await ethL2.connect(randWallet1).approve(perpetual.address, 100)).wait();

    logger.info("Approve l2 erc20");
    await (await erc20L2.connect(randWallet1).approve(perpetual.address, 100)).wait();

    logger.info("Deposit eth to zknet");
    await (await perpetual.connect(randWallet1).deposit(ETH_ID, 100)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ETH_ID)).to.equal(100);

    logger.info("Deposit erc20 to zknet");
    await (await perpetual.connect(randWallet1).deposit(ERC20_ID, 100)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ERC20_ID)).to.equal(100);

    logger.info("Transfer");
    await (await perpetual.connect(randWallet1).transfer(randWallet2.address, ERC20_ID, 50, 0)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ERC20_ID)).to.equal(50);
    expect(await perpetual.connect(randWallet2).balanceOf(randWallet2.address, ERC20_ID)).to.equal(50);

    logger.info("Deposit to position");
    const positionId1 = 1;
    const positionId2 = 2;
    const orderId1 = 1;
    const orderId2 = 2;
    await (await perpetual.connect(randWallet1).positionDeposit(positionId1, ERC20_ID, 50)).wait();
    await (await perpetual.connect(randWallet2).positionDeposit(positionId2, ERC20_ID, 50)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ERC20_ID)).to.equal(0);
    expect(await perpetual.connect(randWallet2).balanceOf(randWallet2.address, ERC20_ID)).to.equal(0);

    logger.info("Settlement order");
    await (
      await perpetual.connect(runtime.deployWallet).settlement(
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
          positionSold: 100,
          partAFee: 1,
          partBFee: 1,
        },
      )
    ).wait();

    logger.info("Withdraw position");
    await (await perpetual.connect(randWallet1).positionWithdraw(positionId1, ERC20_ID, 50)).wait();
    await (await perpetual.connect(randWallet2).positionWithdraw(positionId2, ERC20_ID, 50)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ERC20_ID)).to.equal(50);
    expect(await perpetual.connect(randWallet2).balanceOf(randWallet2.address, ERC20_ID)).to.equal(50);

    logger.info("Withdraw erc20");
    await (await perpetual.connect(randWallet1).withdraw(ERC20_ID, 50)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ERC20_ID)).to.equal(0);
    expect(await randWallet1.getBalance(ERC20_ADDRESS)).to.equal(50);

    logger.info("Withdraw eth");
    await (await perpetual.connect(randWallet1).withdraw(ETH_ID, 100)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, ETH_ID)).to.equal(0);
  });
});
