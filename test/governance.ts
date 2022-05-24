import { log, ZKNet } from "./zknet";
import { formatBytes32String } from "ethers/lib/utils";
import { sleep } from "zksync-web3/build/utils";
import { ethers } from "ethers";
import { Artifacts } from "hardhat/internal/artifacts";
import * as hre from "hardhat";

const zknet = new ZKNet();
// the vote token contract
let cokeErc20Contract: ethers.Contract;
// the governor contract
let cokeDexGovernorContract: ethers.Contract;

async function init() {
  await zknet.init();
}

describe("governance", async function () {
  before(init);

  it("1. deploy cokeErc20", async function () {
    cokeErc20Contract = await zknet.deployContractToEthereum(
      zknet.adminWallet,
      "CokeMgrToken",
      [100]
    );

    log.info("COKE ERC20 contract address: ", cokeErc20Contract.address);

    const artifacts = new Artifacts("artifacts");
    const factoryArtifact = artifacts.readArtifactSync("MyGovernor");
    const factory = await hre.ethers.getContractFactoryFromArtifact(
      factoryArtifact,
      zknet.adminWallet.ethWallet()
    );
    cokeDexGovernorContract = await factory.deploy(cokeErc20Contract.address);

    await cokeDexGovernorContract.deployed();
    log.info(`contract deployed: ${cokeDexGovernorContract.address}`);

    // TODO: GAGAGA
    // cokeDexGovernorContract = await zknet.deployContractToEthereum(
    //   zknet.adminWallet,
    //   "MyGovernor",
    //   [cokeErc20Contract.address]
    // );

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
      .connect(zknet.adminWallet.ethWallet())
      .on("ProposalCreated", (proposalId, proposer) => {
        log.info("proposalId: ", proposalId);
        log.info("proposer: ", proposer);

        cokeDexGovernorContract
          .connect(zknet.adminWallet.ethWallet())
          .state(proposalId)
          .then(function (state: any) {
            log.info("proposal state is: ", state.toString());
          });
      });

    const proposalTx = await cokeDexGovernorContract
      .connect(zknet.adminWallet.ethWallet())
      .propose(
        [tokenAddr],
        [0],
        [transferCalldata],
        "Proposal #1: Give grant to team"
      );

    const x = await proposalTx.wait();
    log.info(x);

    await cokeDexGovernorContract
      .connect(zknet.adminWallet.ethWallet())
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
    sleep(50 * 1000);
  });
});
