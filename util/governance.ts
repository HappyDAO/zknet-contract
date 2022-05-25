import { Governance } from "../typechain-l1";
import { BaseRuntime } from "./base";

export class GovernanceRuntime extends BaseRuntime {
  constructor() {
    super();
  }

  public async deployGovernance(): Promise<Governance> {
    return (await this.deployL1Contract("Governance")) as Governance;
  }
}
