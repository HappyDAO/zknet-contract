import { log, ZKNet } from "./zknet";
import * as zksync from "zksync-web3";
import { formatBytes32String } from "ethers/lib/utils";
import { sleep } from "zksync-web3/build/utils";

const zknet = new ZKNet();
// the vote token contract
let cokeErc20Contract: zksync.Contract;
// the governor contract
let cokeDexGovernorContract: zksync.Contract;

async function init() {
  await zknet.init();
}

describe("governance", async function () {
  before(init);

  it("1. deploy cokeErc20", async function () {
    cokeErc20Contract = await zknet.deployContractToZksync(
      zknet.adminWallet,
      "CokeMgrToken",
      [100000000]
    );
    log.info("COKE ERC20 contract address: ", cokeErc20Contract.address);

    cokeDexGovernorContract = await zknet.deployContractToZksync(
      zknet.adminWallet,
      "MyGovernor",
      [cokeErc20Contract.address] // TODO: FIX ME not set timelock contract address
    );
    log.info(
      "COKE DEX MGR contract address: ",
      cokeDexGovernorContract.address
    );
  });

  it("2. create a proposal", async function () {
    const tokenAddr = cokeErc20Contract.address;
    const teamAddr = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";
    const grantAmount = 100;
    const transferCalldata = cokeErc20Contract.interface.encodeFunctionData(
      "transfer",
      [teamAddr, grantAmount]
    );

    cokeDexGovernorContract
      .connect(zknet.adminWallet)
      .on("ProposalCreated", (proposalId, proposer) => {
        log.info("event: ", proposalId);
        log.info("proposer: ", proposer);

        cokeErc20Contract
          .connect(zknet.adminWallet)
          .transfer(zknet.adminWallet, zknet.normalWallets[1], 100);

        sleep(500);

        cokeDexGovernorContract
          .connect(zknet.adminWallet)
          .state(proposalId)
          .then(function (state: any) {
            log.info(state.toString());
          });
      });

    const proposalTx = await cokeDexGovernorContract
      .connect(zknet.adminWallet)
      .propose(
        [tokenAddr],
        [0],
        [transferCalldata],
        "Proposal #1: Give grant to team"
      );

    await proposalTx.wait();

    await cokeDexGovernorContract
      .connect(zknet.adminWallet)
      .hashProposal(
        [tokenAddr],
        [0],
        [transferCalldata],
        formatBytes32String("Proposal #1: Give grant to team")
      );

    // keccak256(bytes(x))
    //
    // log.info("proposal id is :", id);
    // log.info("xxx", id);
    // const proposalState = await cokeDexGovernorContract
    //   .connect(zknet.adminWallet)
    //   .state(id);
    //
    // log.info(proposalState.toString());
  });
});
