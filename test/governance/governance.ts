import { GovernanceRuntime } from "../../util/governance";
import { CokeDexGovernor, CokeMgrToken } from "../../typechain-l1";
import { logger } from "../../util/log";
import { assert, expect } from "chai";
import { BigNumber, ethers } from "ethers";

const utils = ethers.utils;

describe("Governance", function() {
  let governance: CokeDexGovernor;
  let governanceToken: CokeMgrToken;
  let runtime: GovernanceRuntime;
  let proposalId: BigNumber;

  async function init() {
    // 1. deploy governance token and governance mgr contract
    runtime = new GovernanceRuntime();
    governanceToken = await runtime.deployGovernanceToken([1000]);
    logger.info(`Deployed Governance token contract : ${governanceToken.address}`);

    governance = await runtime.deployGovernance([governanceToken.address]);
    logger.info(`Deployed Governance contract: ${governance.address}`);
    expect(await governance.name()).to.equal("CokeDexGovernor");

    //2. distribute the vote token

  }

  before(init);

  it("1. Submit proposal", async function() {
    const tokenAddr = governanceToken.address;
    const teamAddr = runtime.wallets[1].ethWallet().address;
    const grantAmount = 100;
    const transferCalldata = governanceToken.interface.encodeFunctionData(
      "transfer",
      [teamAddr, grantAmount]
    );
    const desc = "Proposal #1: Give grant to team";

    const proposeTx = await governance.propose([tokenAddr], [0], [transferCalldata], desc);
    const receipt = await proposeTx.wait();
    const decodeRes = governance.interface.decodeFunctionResult("propose", receipt.logs[0].data);
    proposalId = decodeRes[0] as BigNumber;

    logger.info(`decode Proposal id is ${proposalId}`);

    const hashId = await governance.hashProposal([tokenAddr],
      [0],
      [transferCalldata],
      utils.keccak256(utils.toUtf8Bytes(desc)));

    assert(hashId.eq(proposalId), "submit proposal hash should be equal to the calc proposal hash");
  });

  it("2. Vote on a proposal", async function() {
    logger.info("vote");
  });

  it("3. Execute the proposal", async function() {
    logger.info("start to execute a proposal");
  });

});

