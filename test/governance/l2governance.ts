// this test mock the process of l1-l2 governance process

import { expect } from "chai";
import { BigNumber, ethers } from "ethers";

import { CokeDexGovernor, CokeMgrToken } from "../../typechain-l1";
import { Counter } from "../../typechain-l2";
import { GovernanceRuntime } from "../../util/governance";
import { logger } from "../../util/log";
import { utils as zkUtils } from "zksync-web3";

const utils = ethers.utils;

describe("L2Governance", function() {
  let runtime: GovernanceRuntime;

  let governance: CokeDexGovernor;
  let governanceToken: CokeMgrToken;
  let counter: Counter;

  let proposalId: BigNumber;
  const tokenSupply = 1000;
  const governanceMoney = 1000;

  async function init() {
    // 1. deploy governance token and governance mgr contract
    runtime = new GovernanceRuntime();


    governanceToken = await runtime.deployGovernanceToken([tokenSupply + governanceMoney]);
    //  //GovernorSettings(0 /* 1 block */, 45818 /* 1 week */, 0)
    governance = await runtime.deployGovernance([governanceToken.address, 0, 60, 0]);

    logger.info(`contract governance token [${governanceToken.address}] deployed`);
    logger.info(`contract governance [${governance.address}] deployed`);

    counter = (await runtime.deployL2Contract("Counter", [governance.address])) as Counter;
    logger.info(`l2 contract counter [${counter.address}] deployed`);

    //2. distribute the vote token
    logger.info("distribute voting tokens:");

    // allocate some money to the governance contract
    const transferTx = await governanceToken.transfer(governance.address, 1000);
    await transferTx.wait();
    expect(await governanceToken.balanceOf(governance.address)).to.equal(1000);

    // const voters = runtime.wallets;
    // for (let i = 1; i < voters.length; i++) {
    //   const voterWallet = voters[i].ethWallet();
    //   const avgVotePower = tokenSupply / (voters.length + 1); // TODO: FIX ME
    //   const transferTx = await governanceToken.transfer(voterWallet.address, avgVotePower);
    //   await transferTx.wait();
    //   expect(await governanceToken.balanceOf(voterWallet.address)).to.equal(avgVotePower);
    //   logger.info(`transfer [${avgVotePower}] token to ${voterWallet.address} successful`);
    //
    //   // should self delegate to obtain voting power
    //   const delegateTx = await governanceToken.connect(voterWallet).delegate(voterWallet.address);
    //   await delegateTx.wait();
    // }
  }

  before(init);

  // it("1. Submit l1-l2 proposal", async function() {
  //
  //   const zkSyncAddress = await runtime.providerL2.getMainContractAddress();
  //   // const zkSyncContract = new ethers.Contract(zkSyncAddress, zkUtils.ZKSYNC_MAIN_ABI, runtime.deployWallet);
  //   const data = counter.interface.encodeFunctionData("increment");
  //
  //   const ergsLimit = BigNumber.from(100);
  //   const invokeAddr = governance.address;
  //   const invokeData = governance.interface.encodeFunctionData("callZkSync", [zkSyncAddress, counter.address, data, ergsLimit]);
  //
  //   const desc = "Proposal #2: Increment l2 counter";
  //
  //   const proposeTx = await governance.propose([invokeAddr], [0], [invokeData], desc);
  //   const receipt = await proposeTx.wait();
  //   const decodeRes = governance.interface.decodeFunctionResult("propose", receipt.logs[0].data);
  //   proposalId = decodeRes[0] as BigNumber;
  //
  //   logger.info(`decode Proposal id is ${proposalId}`);
  //
  //   const hashId = await governance.hashProposal([invokeAddr], [0], [invokeData], utils.id(desc));
  //
  //   assert(hashId.eq(proposalId), "submit proposal hash should be equal to the calc proposal hash");
  // });
  //
  // it("2. Vote on a proposal", async function() {
  //   const voters = runtime.wallets;
  //
  //   logger.info("start to mock the vote process: ");
  //   let proposalState = await governance.state(proposalId);
  //   logger.info(`proposal [${proposalId}] state is : ${proposalState}`);
  //
  //   for (let i = 1; i < voters.length; i++) {
  //     const voteWallet = voters[i].ethWallet();
  //     const voteTx = await governance.connect(voteWallet).castVote(proposalId, 1);
  //     await voteTx.wait();
  //
  //     const proposalVotes = await governance.proposalVotes(proposalId);
  //     logger.info(`proposal votes info: ${proposalVotes}`);
  //
  //     const proposalState = await governance.state(proposalId);
  //     logger.info(`proposal [${proposalId}] state is : ${proposalState}`);
  //   }
  //
  //   await runtime.waitForDeadline(BigNumber.from(1), governance, proposalId);
  //
  //   proposalState = await governance.state(proposalId);
  //   logger.info(`proposal [${proposalId}] state is : ${proposalState} after deadline`);
  // });

  it("3. Execute l1-l2 proposal", async function() {
    logger.info("start to execute a proposal");
    const zkSyncAddress = await runtime.providerL2.getMainContractAddress();
    logger.info(`main contract addr: ${zkSyncAddress}`);
    const zkSyncContract = new ethers.Contract(zkSyncAddress, zkUtils.ZKSYNC_MAIN_ABI, runtime.deployWallet);
    const data = counter.interface.encodeFunctionData("increment", [5]);

    const ergsLimit = BigNumber.from(100);
    const gasPrice = await runtime.providerL1.getGasPrice();
    // Getting the cost of the execution.
    const baseCost = await zkSyncContract.executeBaseCost(gasPrice, ergsLimit, ethers.utils.arrayify(data).length, 0, 0);

    // const invokeAddr = governance.address;
    // const invokeData = governance.interface.encodeFunctionData("callZkSync", [zkSyncAddress, counter.address, data, ergsLimit]);
    //
    // const desc = "Proposal #2: Increment l2 counter";

    // const executeTx = await governance.execute([invokeAddr], [0], [invokeData], ethers.utils.id(desc));
    // await executeTx.wait();
    const executeTx = await governance.callZkSync(zkSyncAddress, counter.address, data, ergsLimit, {
      value: baseCost,
      gasPrice
    });
    await executeTx.wait();

    const l2Response = await runtime.providerL2.getL2TransactionFromPriorityOp(executeTx);

    // The receipt of the L2 transaction corresponding to the call to the Increment contract
    const l2Receipt = await l2Response.wait();

    logger.info(`counter value is ${await counter.value()}`);
    logger.info(`Transaction successful! L2 hash: ${l2Receipt.transactionHash}`);

  });
});
