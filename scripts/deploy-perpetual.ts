import * as zksync from "zksync-web3";

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
  await (await perpetual.registerToken(ERC20_ADDRESS, 1)).wait();
  await runtime.prepareL2Wallet("1100", "1000", "0x8fa6d869bc0453c179b0004518f9043306ef3c43ecadd2387297df5c6a1963a9");
  await runtime.prepareL2Wallet("1100", "1000", "0x9890a78d684c13a7ce31eb8edc9ba062928a66f9bf4c3e40d1acab2dc32e52d5");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
