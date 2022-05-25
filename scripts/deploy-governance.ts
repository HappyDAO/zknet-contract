import { ethers } from "hardhat";

import { GovernanceRuntime } from "../util/governance";
import { logger } from "../util/log";

async function main() {
  const runtime = new GovernanceRuntime();

  const wallet = new ethers.Wallet(
    process.env.DEPLOY_PRIVATE_KEY ? process.env.DEPLOY_PRIVATE_KEY : "",
    runtime.providerL1,
  );

  const governance = await runtime.deployL1Contract("Governance", [], wallet);
  logger.info("Governance deployed to %s", governance.address);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
