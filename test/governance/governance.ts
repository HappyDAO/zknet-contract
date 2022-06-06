import { assert, expect } from "chai";
import { BigNumber, ethers } from "ethers";

import { CokeDexGovernor, CokeMgrToken } from "../../typechain-l1";
import { GovernanceRuntime } from "../../util/governance";
import { logger } from "../../util/log";

const utils = ethers.utils;

describe("Governance", function () {
  let governance: CokeDexGovernor;
  let governanceToken: CokeMgrToken;
  let runtime: GovernanceRuntime;
  let proposalId: BigNumber;
  const tokenSupply = 1000;
  const governanceMoney = 1000;

  async function init() {
    // 1. deploy governance token and governance mgr contract
    runtime = new GovernanceRuntime();
    logger.info(`current block number: ${await runtime.providerL1.getBlockNumber()}`);
    governanceToken = await runtime.deployGovernanceToken([tokenSupply + governanceMoney]);
    logger.info(`Deployed Governance token contract : ${governanceToken.address}`);
    //  //GovernorSettings(0 /* 1 block */, 45818 /* 1 week */, 0)
    governance = await runtime.deployGovernance([governanceToken.address, 0, 100, 0]);
    logger.info(`Deployed Governance contract: ${governance.address}`);
    expect(await governance.name()).to.equal("CokeDexGovernor");

    //2. distribute the vote token
    logger.info("distribute voting tokens:");

    // allocate some money to the governance contract
    const transferTx = await governanceToken.transfer(governance.address, 1000);
    await transferTx.wait();
    expect(await governanceToken.balanceOf(governance.address)).to.equal(1000);

    const voters = runtime.wallets;
    for (let i = 1; i < voters.length; i++) {
      const voterWallet = voters[i].ethWallet();
      const avgVotePower = tokenSupply / (voters.length + 1); // TODO: FIX ME
      const transferTx = await governanceToken.transfer(voterWallet.address, avgVotePower);
      await transferTx.wait();
      expect(await governanceToken.balanceOf(voterWallet.address)).to.equal(avgVotePower);
      logger.info(`transfer [${avgVotePower}] token to ${voterWallet.address} successful`);

      // should self delegate to obtain voting power
      const delegateTx = await governanceToken.connect(voterWallet).delegate(voterWallet.address);
      await delegateTx.wait();

      const votePower = await governanceToken.getVotes(voterWallet.address);
      logger.info(`voter ${voterWallet.address} votes power is ${votePower}`);
    }
  }

  before(init);

  it("1. Submit proposal", async function () {
    const tokenAddr = governanceToken.address;
    const teamAddr = runtime.wallets[1].ethWallet().address;
    const grantAmount = 100;
    const transferCalldata = governanceToken.interface.encodeFunctionData("transfer", [teamAddr, grantAmount]);
    const desc = "Proposal #1: Give grant to team";

    const proposeTx = await governance.propose([tokenAddr], [0], [transferCalldata], desc);
    const receipt = await proposeTx.wait();
    const decodeRes = governance.interface.decodeFunctionResult("propose", receipt.logs[0].data);
    proposalId = decodeRes[0] as BigNumber;

    logger.info(`decode Proposal id is ${proposalId}`);

    const hashId = await governance.hashProposal([tokenAddr], [0], [transferCalldata], utils.id(desc));

    assert(hashId.eq(proposalId), "submit proposal hash should be equal to the calc proposal hash");
    // wait for proposal to be ready
    //await runtime.waitForSnapshot(BigNumber.from(0), governance, proposalId);
  });

  it("2. Vote on a proposal", async function () {
    const voters = runtime.wallets;

    logger.info("start to mock the vote process: ");
    let proposalState = await governance.state(proposalId);
    logger.info(`proposal [${proposalId}] state is : ${proposalState}`);

    governance.on("VoteCast", (account, pid, support, weight, reason, event) => {
      logger.info(
        `account ${account}, pid: ${pid}, support: ${support}, weight: ${weight}, reason: ${reason}, event: ${event}`,
      );
    });

    for (let i = 1; i < voters.length; i++) {
      const voteWallet = voters[i].ethWallet();
      const voteTx = await governance.connect(voteWallet).castVote(proposalId, 1);
      await voteTx.wait();

      const proposalVotes = await governance.proposalVotes(proposalId);
      logger.info(`proposal votes info: ${proposalVotes}`);

      const proposalState = await governance.state(proposalId);
      logger.info(`proposal [${proposalId}] state is : ${proposalState}`);
    }

    await runtime.waitForDeadline(BigNumber.from(1), governance, proposalId);

    proposalState = await governance.state(proposalId);
    logger.info(`proposal [${proposalId}] state is : ${proposalState} after deadline`);
  });

  it("3. Execute the proposal", async function () {
    logger.info("start to execute a proposal");
    const tokenAddr = governanceToken.address;
    const teamAddr = runtime.wallets[1].ethWallet().address;
    const grantAmount = 100;
    const transferCalldata = governanceToken.interface.encodeFunctionData("transfer", [teamAddr, grantAmount]);
    const desc = "Proposal #1: Give grant to team";

    let teamBalance = await governanceToken.balanceOf(teamAddr);
    logger.info(`before execute proposal team [${teamAddr}] balance is ${teamBalance}`);
    logger.info(`before execute proposal governance balance is ${await governanceToken.balanceOf(governance.address)}`);
    logger.info(`current block number: ${await runtime.providerL1.getBlockNumber()}`);

    const executeTx = await governance.execute([tokenAddr], [0], [transferCalldata], ethers.utils.id(desc));
    await executeTx.wait();

    teamBalance = await governanceToken.balanceOf(teamAddr);
    logger.info(`after execute proposal team [${teamAddr}] balance is ${teamBalance}`);
    logger.info(`after execute proposal  governance balance is ${await governanceToken.balanceOf(governance.address)}`);
  });
});
