import { GovernanceRuntime } from "../../util/governance";
import { CokeDexGovernor, CokeMgrToken } from "../../typechain-l1";
import { logger } from "../../util/log";
import { expect } from "chai";

describe("Governance", function() {
  let governance: CokeDexGovernor;
  let governanceToken: CokeMgrToken;
  let runtime: GovernanceRuntime;

  async function init() {
    runtime = new GovernanceRuntime();
    governanceToken = await runtime.deployGovernanceToken([100]);
    logger.info(`Deployed Governance token contract : ${governanceToken.address}`);

    governance = await runtime.deployGovernance([governanceToken.address]);
    logger.info(`Deployed Governance contract: ${governance.address}`);
    expect(await governance.name()).to.equal("CokeDexGovernor");
  }

  beforeEach(init);

  it("test governance", async function() {
    logger.info("Prepare test wallets");
  });
});
