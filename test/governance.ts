import { log, ZKNet } from "./zknet";

const zknet = new ZKNet();

async function init() {
  log.info("1");
  await zknet.init();
}

describe("governance", async function () {
  before(init);

  it("init", async function () {
    log.info("2");
    const adminWallet = zknet.adminWallet;

    const perpetual = await zknet.deployPerpetual(adminWallet);
    log.info("perpetual contract address: ", perpetual.address);

    log.info("start successful");
  });
});
