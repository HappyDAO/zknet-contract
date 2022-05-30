import { CokeDexGovernor, CokeMgrToken } from "../typechain-l1";
import { BaseRuntime } from "./base";

const CokeDexGovernor = "CokeDexGovernor";
const CokeDexToken = "CokeMgrToken";

export class GovernanceRuntime extends BaseRuntime {
  constructor() {
    super();
  }

  public async deployGovernance(constructorArguments: any[]): Promise<CokeDexGovernor> {
    // MyGovernor should change with the real contract type
    return (await this.deployL1Contract(CokeDexGovernor, constructorArguments)) as CokeDexGovernor;
  }

  public async deployGovernanceToken(constructorArguments: any[]): Promise<CokeMgrToken> {
    return (await this.deployL1Contract(CokeDexToken, constructorArguments)) as CokeMgrToken;
  }
}
