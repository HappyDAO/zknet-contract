import { BigNumber } from "ethers";

import { CokeDexGovernor, CokeMgrToken } from "../typechain-l1";
import { BaseRuntime } from "./base";

const { time } = require("@openzeppelin/test-helpers");

const cokeDexGovernorName = "CokeDexGovernor";
const cokeDexTokenName = "CokeMgrToken";

export class GovernanceRuntime extends BaseRuntime {
  constructor() {
    super();
  }

  public async deployGovernance(constructorArguments: any[]): Promise<CokeDexGovernor> {
    // MyGovernor should change with the real contract type
    return (await this.deployL1Contract(cokeDexGovernorName, constructorArguments)) as CokeDexGovernor;
  }

  public async deployGovernanceToken(constructorArguments: any[]): Promise<CokeMgrToken> {
    return (await this.deployL1Contract(cokeDexTokenName, constructorArguments)) as CokeMgrToken;
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
}
