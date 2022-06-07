// this test mock the process of l1-l2 governance process
import { assert, expect } from "chai";
import { BigNumber, ethers } from "ethers";
import { utils as zkUtils } from "zksync-web3";

import { Counter } from "../../typechain-l2";
import { GovernanceRuntime, Proposal } from "../../util/governance";
import { logger } from "../../util/log";

const utils = ethers.utils;

describe("L2Governance", function () {
  let runtime: GovernanceRuntime;
  let counter: Counter;
  let proposal: Proposal;

  const tokenSupply = 1000;
  const governanceMoney = 1000;

  async function init() {
    // 1. deploy governance token and governance mgr contract
    runtime = new GovernanceRuntime();
    await runtime.deployGovernanceToken([tokenSupply + governanceMoney]);
    //  //GovernorSettings(0 /* 1 block */, 45818 /* 1 week */, 0)
    await runtime.deployGovernance([runtime.token.address, 0, 60, 0]);

    logger.info(`contract governance token [${runtime.token.address}] deployed`);
    logger.info(`contract governance [${runtime.governor.address}] deployed`);

    counter = (await runtime.deployL2Contract("Counter", [runtime.governor.address])) as Counter;
    logger.info(`l2 contract counter [${counter.address}] deployed`);

    //2. distribute the vote token
    logger.info("distribute voting tokens:");
    await runtime.initVotePower(tokenSupply);

    // allocate some money to the governance contract
    const depositTx = await runtime.deployWallet.ethWallet().sendTransaction({
      to: runtime.governor.address,
      value: BigNumber.from(10000000000000),
      gasLimit: BigNumber.from(99999),
      gasPrice: 100,
    });
    await depositTx.wait();
  }

  async function generateProposal(): Promise<Proposal> {
    const zkSyncAddress = await runtime.providerL2.getMainContractAddress();
    const data = counter.interface.encodeFunctionData("increment", [5]);
    // Getting the cost of the execution.
    const gasPrice = await runtime.providerL1.getGasPrice();
    const ergsLimit = BigNumber.from(100);
    const zkSyncContract = new ethers.Contract(
      zkSyncAddress,
      zkUtils.ZKSYNC_MAIN_ABI,
      runtime.deployWallet.ethWallet(),
    );
    const baseCost = await zkSyncContract.executeBaseCost(
      gasPrice,
      ergsLimit,
      ethers.utils.arrayify(data).length,
      0,
      0,
    );

    const invokeData = runtime.governor.interface.encodeFunctionData("callZkSync", [
      zkSyncAddress,
      counter.address,
      data,
      ergsLimit,
    ]);
    const desc = "Proposal #2: Increment l2 counter";
    return new Proposal(runtime.governor.address, baseCost, invokeData, desc);
  }

  before(init);

  it("1. Submit l1-l2 proposal", async function () {
    proposal = await generateProposal();
    const proposeTx = await runtime.governor.propose(
      [proposal.target],
      [proposal.value],
      [proposal.calldata],
      proposal.desc,
    );
    const receipt = await proposeTx.wait();
    const decodeRes = runtime.governor.interface.decodeFunctionResult("propose", receipt.logs[0].data);
    proposal.id = decodeRes[0] as BigNumber;
    const proposalId = proposal.id;
    logger.info(`decode Proposal id is ${proposalId}`);

    const hashId = await runtime.governor.hashProposal(
      [proposal.target],
      [proposal.value],
      [proposal.calldata],
      utils.id(proposal.desc),
    );

    assert(hashId.eq(proposalId), "submit proposal hash should be equal to the calc proposal hash");
  });

  it("2. Vote on l1-l2 proposal", async function () {
    const governance = runtime.governor;
    logger.info("start to mock the vote process: ");
    const proposalId = proposal.id;
    let proposalState = await governance.state(proposalId);
    logger.info(`before vote, proposal [${proposalId}] state is : ${proposalState}`);

    await runtime.mockVote(proposalId);
    await runtime.waitForDeadline(BigNumber.from(1), governance, proposalId);

    proposalState = await governance.state(proposalId);
    expect(proposalState).to.equal(4);
    logger.info(`after vote ,the proposal [${proposalId}] state is : ${proposalState} after deadline`);
  });

  it("3. Execute l1-l2 proposal", async function () {
    const governance = runtime.governor;
    logger.info("start to execute a proposal");
    const executeTx = await governance.execute(
      [proposal.target],
      [proposal.value],
      [proposal.calldata],
      ethers.utils.id(proposal.desc),
    );
    await executeTx.wait();

    const l2Response = await runtime.providerL2.getL2TransactionFromPriorityOp(executeTx);

    // The receipt of the L2 transaction corresponding to the call to the Increment contract
    const l2Receipt = await l2Response.wait();

    logger.info(`counter value is ${await counter.value()}`);
    logger.info(`Transaction successful! L2 hash: ${l2Receipt.transactionHash}`);
  });
});
