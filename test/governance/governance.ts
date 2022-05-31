import { GovernanceRuntime } from "../../util/governance";
import { CokeDexGovernor, CokeMgrToken } from "../../typechain-l1";
import { logger } from "../../util/log";
import { expect } from "chai";
import { ethers } from "ethers";

const utils = ethers.utils;

describe("Governance", function() {
  let governance: CokeDexGovernor;
  let governanceToken: CokeMgrToken;
  let runtime: GovernanceRuntime;

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
    const teamAddr = runtime.wallets[0].address;
    const grantAmount = 100;
    const transferCalldata = governanceToken.interface.encodeFunctionData(
      "transfer",
      [teamAddr, grantAmount]
    );

    const res = await governance.propose([tokenAddr], [0], [transferCalldata], "Proposal #1: Give grant to team");

    const proposalId = utils.defaultAbiCoder.decode(["uint256"], res.data);
    
    logger.info(`decode Proposal id is ${proposalId}`);

    // const hashId = await governance.hashProposal([tokenAddr], [0], [transferCalldata], utils.formatBytes32String("Proposal #1: Give grant to team"));
    // logger.info(`#1 proposal id is: ${hashId}`);


    expect(await governance.state(proposalId)).to.equal(1);
  });

});

