import * as zksync from "zksync-web3";

import { logger } from "../util/log";
import { PerpetualRuntime } from "../util/perpetual";

async function main() {
  const runtime = new PerpetualRuntime();

  const wallet = new zksync.Wallet(
    process.env.DEPLOY_PRIVATE_KEY ? process.env.DEPLOY_PRIVATE_KEY : "",
    runtime.providerL2,
    runtime.providerL1,
  );

  const perpetual = await runtime.deployL2Contract("Perpetual", [], wallet);
  logger.info("Perpetual deployed to %s", perpetual.address);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
