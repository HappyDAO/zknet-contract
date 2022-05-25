import { Governance } from "../../typechain-l1";
import { GovernanceRuntime } from "../../util/governance";
import { logger } from "../../util/log";

describe("Governance", function () {
  let governance: Governance;
  let runtime: GovernanceRuntime;

  async function init() {
    logger.info("Init Governance");
    runtime = new GovernanceRuntime();
    governance = await runtime.deployGovernance();
  }

  beforeEach(init);

  it("test governance", async function () {
    logger.info("Prepare test wallets");
    const randWallet1 = await runtime.prepareL1Wallet("110");
    const randWallet2 = await runtime.prepareL2Wallet("110");
  });
});
