import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import * as hre from "hardhat";

import { ITrade, Perpetual } from "../../typechain-l2";
import { logger } from "../../util/log";

const ETH_ID = 0;
const USDT_ID = 1;

const orderTypes = {
  Order: [
    { name: "id", type: "uint256" },
    { name: "typ", type: "string" },
    { name: "trader", type: "address" },
    { name: "positionId", type: "uint64" },
    { name: "positionToken", type: "uint32" },
    { name: "positionAmount", type: "int256" },
    { name: "limitPrice", type: "uint256" },
    { name: "triggerPrice", type: "uint256" },
    { name: "fee", type: "uint256" },
    { name: "timestamp", type: "uint32" },
  ],
};

describe("DEVPerpetual", function () {
  let perpetual: Perpetual;
  let adminWallet: SignerWithAddress;
  let randWallet1: SignerWithAddress;
  let randWallet2: SignerWithAddress;
  let eip712DomainName: string = "ZKnet Perpetual";
  let eip712DomainVersion: string = "1";

  async function devSignOrder(wallet: SignerWithAddress, order: ITrade.OrderStruct): Promise<ITrade.OrderStruct> {
    const domain = {
      name: eip712DomainName,
      version: eip712DomainVersion,
      chainId: 1,
      verifyingContract: perpetual.address,
    };

    order.trader = wallet.address;
    const message = {
      id: order.id,
      typ: order.typ,
      trader: order.trader,
      positionId: order.positionId,
      positionToken: order.positionToken,
      positionAmount: order.positionAmount,
      limitPrice: order.limitPrice,
      triggerPrice: order.triggerPrice,
      fee: order.fee,
      timestamp: order.timestamp,
    };
    order.signature = await wallet._signTypedData(domain, orderTypes, message);
    return order;
  }

  async function printPositionInfo(positionId1: number, positionId2: number) {
    await perpetual.connect(randWallet1).printPosition(positionId1);
    await perpetual.connect(randWallet2).printPosition(positionId2);
  }

  async function init() {
    logger.info("Init Perpetual");
    [adminWallet, randWallet1, randWallet2] = await hre.ethers.getSigners();
    const f = await hre.ethers.getContractFactory("Perpetual");
    const c = await f.deploy(eip712DomainName, eip712DomainVersion);
    await c.deployed();
    perpetual = c as Perpetual;
  }

  beforeEach(init);

  it("test trade", async function () {
    logger.info("Prepare test wallets");
    const initBalanceAmount = 10000000000;
    const initMarginAmount = 10000;
    const positionAmount = 10;
    const positionPrice = "100";

    await (await perpetual.connect(randWallet1).devDeposit(USDT_ID, initBalanceAmount)).wait();
    await (await perpetual.connect(randWallet2).devDeposit(USDT_ID, initBalanceAmount)).wait();
    expect(await perpetual.connect(randWallet1).balanceOf(randWallet1.address, USDT_ID)).to.equal(initBalanceAmount);
    expect(await perpetual.connect(randWallet2).balanceOf(randWallet2.address, USDT_ID)).to.equal(initBalanceAmount);

    logger.info("Deposit to position");
    const positionId1 = 1;
    const positionId2 = 2;
    let orderId1 = 1;
    let orderId2 = 2;
    await (await perpetual.connect(randWallet1).positionDeposit(positionId1, USDT_ID, initMarginAmount)).wait();
    await (await perpetual.connect(randWallet2).positionDeposit(positionId2, USDT_ID, initMarginAmount)).wait();
    expect(await perpetual.connect(randWallet1).positionMarginBalanceOf(positionId1)).to.equal(initMarginAmount);
    expect(await perpetual.connect(randWallet2).positionMarginBalanceOf(positionId2)).to.equal(initMarginAmount);

    logger.info("FundingTick1");
    perpetual.connect(adminWallet).fundingTick([
      {
        token: ETH_ID,
        price: positionPrice,
        timestamp: Math.floor(Date.now() / 1000),
      },
    ]);

    logger.info("OraclePricesTick1");
    perpetual.connect(adminWallet).oraclePricesTick([
      {
        token: ETH_ID,
        price: positionPrice,
        timestamp: Math.floor(Date.now() / 1000),
        signedPrices: [],
      },
    ]);

    logger.info("Open Position");
    await (
      await perpetual.connect(adminWallet).settlement(
        await devSignOrder(randWallet1, {
          id: orderId1,
          typ: "LIMIT",
          trader: "",
          positionId: positionId1,
          positionToken: ETH_ID,
          positionAmount: positionAmount,
          limitPrice: positionPrice,
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        await devSignOrder(randWallet2, {
          id: orderId2,
          typ: "LIMIT",
          trader: "",
          positionId: positionId2,
          positionToken: ETH_ID,
          positionAmount: -positionAmount,
          limitPrice: positionPrice,
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        {
          positionSold: 10,
          partAFee: 1,
          partBFee: 1,
        },
      )
    ).wait();

    logger.info("Log Position");
    await perpetual.connect(randWallet1).devSettlePosition(positionId1);
    await perpetual.connect(randWallet2).devSettlePosition(positionId2);

    await printPositionInfo(positionId1, positionId2);
    expect(await perpetual.connect(randWallet1).positionBalanceOf(positionId1)).to.equal(positionAmount);
    expect(await perpetual.connect(randWallet2).positionBalanceOf(positionId2)).to.equal(-positionAmount);

    logger.info("Add Position");
    orderId1 = orderId1 + 2;
    orderId2 = orderId2 + 2;
    await (
      await perpetual.connect(adminWallet).settlement(
        await devSignOrder(randWallet1, {
          id: orderId1,
          typ: "LIMIT",
          trader: "",
          positionId: positionId1,
          positionToken: ETH_ID,
          positionAmount: positionAmount,
          limitPrice: "102",
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        await devSignOrder(randWallet2, {
          id: orderId2,
          typ: "LIMIT",
          trader: "",
          positionId: positionId2,
          positionToken: ETH_ID,
          positionAmount: -positionAmount,
          limitPrice: "102",
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        {
          positionSold: 10,
          partAFee: 1,
          partBFee: 1,
        },
      )
    ).wait();

    logger.info("Log Position");
    await perpetual.connect(randWallet1).devSettlePosition(positionId1);
    await perpetual.connect(randWallet2).devSettlePosition(positionId2);

    await printPositionInfo(positionId1, positionId2);
    expect(await perpetual.connect(randWallet1).positionBalanceOf(positionId1)).to.equal(2 * positionAmount);
    expect(await perpetual.connect(randWallet2).positionBalanceOf(positionId2)).to.equal(-2 * positionAmount);

    logger.info("Reduce Position");
    orderId1 = orderId1 + 2;
    orderId2 = orderId2 + 2;
    await (
      await perpetual.connect(adminWallet).settlement(
        await devSignOrder(randWallet1, {
          id: orderId1,
          typ: "LIMIT",
          trader: "",
          positionId: positionId1,
          positionToken: ETH_ID,
          positionAmount: -positionAmount,
          limitPrice: "102",
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        await devSignOrder(randWallet2, {
          id: orderId2,
          typ: "LIMIT",
          trader: "",
          positionId: positionId2,
          positionToken: ETH_ID,
          positionAmount: positionAmount,
          limitPrice: "102",
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        {
          positionSold: 10,
          partAFee: 1,
          partBFee: 1,
        },
      )
    ).wait();

    logger.info("Log Position");
    await perpetual.connect(randWallet1).devSettlePosition(positionId1);
    await perpetual.connect(randWallet2).devSettlePosition(positionId2);

    await printPositionInfo(positionId1, positionId2);
    expect(await perpetual.connect(randWallet1).positionBalanceOf(positionId1)).to.equal(positionAmount);
    expect(await perpetual.connect(randWallet2).positionBalanceOf(positionId2)).to.equal(-positionAmount);

    logger.info("Funding pay");
    logger.info("FundingTick2");
    perpetual.connect(adminWallet).fundingTick([
      {
        token: ETH_ID,
        price: "98",
        timestamp: Math.floor(Date.now() / 1000),
      },
    ]);
    logger.info("Log Position");
    await perpetual.connect(randWallet1).devSettlePosition(positionId1);
    await perpetual.connect(randWallet2).devSettlePosition(positionId2);

    await printPositionInfo(positionId1, positionId2);
    expect(await perpetual.connect(randWallet1).positionBalanceOf(positionId1)).to.equal(positionAmount);
    expect(await perpetual.connect(randWallet2).positionBalanceOf(positionId2)).to.equal(-positionAmount);

    logger.info("Liquidate");
    logger.info("OraclePricesTick2");
    perpetual.connect(adminWallet).oraclePricesTick([
      {
        token: ETH_ID,
        price: "1097",
        timestamp: Math.floor(Date.now() / 1000),
        signedPrices: [],
      },
    ]);

    orderId1 = orderId1 + 2;
    orderId2 = orderId2 + 2;
    await (
      await perpetual.connect(adminWallet).liquidate(
        positionId2,
        await devSignOrder(randWallet1, {
          id: orderId1,
          typ: "LIMIT",
          trader: "",
          positionId: positionId1,
          positionToken: ETH_ID,
          positionAmount: -positionAmount,
          limitPrice: "1096",
          triggerPrice: "101",
          fee: 1,
          extend: "{}",
          timestamp: Math.floor(Date.now() / 1000),
          signature: "",
        }),
        {
          positionSold: 5,
          partAFee: 1,
          partBFee: 1,
        },
      )
    ).wait();

    logger.info("Log Position");
    await perpetual.connect(randWallet1).devSettlePosition(positionId1);
    await perpetual.connect(randWallet2).devSettlePosition(positionId2);
    await printPositionInfo(positionId1, positionId2);
  });
});
