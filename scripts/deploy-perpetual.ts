import * as zksync from "zksync-web3";
import { ETH_ADDRESS } from "zksync-web3/build/utils";

import { logger } from "../util/log";
import { ERC20_ADDRESS, PerpetualRuntime } from "../util/perpetual";

async function main() {
  const runtime = new PerpetualRuntime();

  const wallet = new zksync.Wallet(
    process.env.DEPLOY_PRIVATE_KEY ? process.env.DEPLOY_PRIVATE_KEY : "",
    runtime.providerL2,
    runtime.providerL1,
  );

  const perpetual = await runtime.deployL2Contract("Perpetual", ["ZKnet Perpetual", "1"], wallet);
  logger.info("Perpetual deployed to %s", perpetual.address);
  await (await perpetual.registerToken(ETH_ADDRESS, 0)).wait();
  await (await perpetual.registerToken(ERC20_ADDRESS, 1)).wait();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
