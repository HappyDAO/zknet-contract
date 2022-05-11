import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Perpetual", function () {
  let perpetual;
  let perpetualProxy: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    perpetual = await ethers.getContractFactory("Perpetual");
    perpetualProxy = await upgrades.deployProxy(perpetual, []);
    await perpetualProxy.connect(owner).deployed();
  });

  it("test vault", async function () {
    const tx = await perpetualProxy
      .connect(owner)
      .mint("0x1F4FD8934a6420348B1c7825DA345F97a2675F7a", 100);
    await tx.wait();

    expect(
      await perpetualProxy
        .connect(owner)
        .balance("0x1F4FD8934a6420348B1c7825DA345F97a2675F7a")
    ).to.equal(100);

    await expect(
      perpetualProxy
        .connect(addr1)
        .mint("0x1F4FD8934a6420348B1c7825DA345F97a2675F7a", 100)
    ).to.be.revertedWith("AccessControl: caller is not the manager");
  });
});
