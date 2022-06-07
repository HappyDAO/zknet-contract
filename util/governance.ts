import { expect } from "chai";
import { BigNumber, BigNumberish, BytesLike } from "ethers";

import { CokeDexGovernor, CokeMgrToken } from "../typechain-l1";
import { BaseRuntime } from "./base";
import { logger } from "./log";

const { time } = require("@openzeppelin/test-helpers");

const cokeDexGovernorName = "CokeDexGovernor";
const cokeDexTokenName = "CokeMgrToken";

export class GovernanceRuntime extends BaseRuntime {
  public governor: CokeDexGovernor;
  public token: CokeMgrToken;

  constructor() {
    super();
    this.governor = {} as CokeDexGovernor;
    this.token = {} as CokeMgrToken;
  }

  public async deployGovernance(constructorArguments: any[]): Promise<CokeDexGovernor> {
    // MyGovernor should change with the real contract type
    this.governor = (await this.deployL1Contract(cokeDexGovernorName, constructorArguments)) as CokeDexGovernor;
    return this.governor;
  }

  public async deployGovernanceToken(constructorArguments: any[]): Promise<CokeMgrToken> {
    this.token = (await this.deployL1Contract(cokeDexTokenName, constructorArguments)) as CokeMgrToken;
    return this.token;
  }

  public async waitForSnapshot(offset: BigNumber, governor: CokeDexGovernor, proposalId: BigNumber) {
    return governor
      .proposalSnapshot(proposalId)
      .then(blockNumber => time.advanceBlockTo(blockNumber.add(offset).toNumber()));
  }

  public async waitForDeadline(offset: BigNumber, governor: CokeDexGovernor, proposalId: BigNumber) {
    return governor
      .proposalDeadline(proposalId)
      .then(blockNumber => time.advanceBlockTo(blockNumber.add(offset).toNumber()));
  }

  /**
   * distribute vote token and self-delegate
   * @param tokenSupply total vote token supply
   */
  public async initVotePower(tokenSupply: number) {
    const voters = this.wallets;
    for (let i = 1; i < voters.length; i++) {
      const voterWallet = voters[i].ethWallet();
      const avgVotePower = tokenSupply / (voters.length + 1); // TODO: FIX ME
      const transferTx = await this.token.transfer(voterWallet.address, avgVotePower);
      await transferTx.wait();
      expect(await this.token.balanceOf(voterWallet.address)).to.equal(avgVotePower);
      logger.info(`transfer [${avgVotePower}] token to ${voterWallet.address} successful`);

      // should self delegate to obtain voting power
      const delegateTx = await this.token.connect(voterWallet).delegate(voterWallet.address);
      await delegateTx.wait();
    }
  }

  /**
   * mock all members vote process
   * @param proposalId
   */
  public async mockVote(proposalId: BigNumberish) {
    const voters = this.wallets;
    for (let i = 1; i < voters.length; i++) {
      const voteWallet = voters[i].ethWallet();
      const voteTx = await this.governor.connect(voteWallet).castVote(proposalId, 1);
      await voteTx.wait();
      const proposalVotes = await this.governor.proposalVotes(proposalId);
      logger.info(`proposal votes info: ${proposalVotes}`);
    }
  }
}

export class Proposal {
  public target: string; // invoke contract address
  public value: BigNumberish; // gas fee to invoke
  public calldata: BytesLike; // encode of the invoke function and data
  public desc: string; // proposal description

  public id: BigNumber; // calc from upon properties

  constructor(_target: string, _value: BigNumberish, _calldata: BytesLike, _desc: string) {
    this.target = _target;
    this.value = _value;
    this.calldata = _calldata;
    this.desc = _desc;
    this.id = BigNumber.from(0);
  }
}
