import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";

describe("Perpetual", function () {
  it("test vault", async function () {
    const Greeter = await ethers.getContractFactory("Perpetual");
    const greeter = await Greeter.deploy();
    await greeter.deployed();

    const tx = await greeter.mint("0x1F4FD8934a6420348B1c7825DA345F97a2675F7a",100);

    // wait until the transaction is mined
    await tx.wait();

    expect(await greeter.balance("0x1F4FD8934a6420348B1c7825DA345F97a2675F7a")).to.equal(100);
  });
});
