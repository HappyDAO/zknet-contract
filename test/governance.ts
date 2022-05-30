// import { log, ZKNet } from "./zknet";
// import { formatBytes32String } from "ethers/lib/utils";
// import { ethers } from "ethers";
//
// const zknet = new ZKNet();
// // the vote token contract
// let cokeErc20Contract: ethers.Contract;
// // the governor contract
// let cokeDexGovernorContract: ethers.Contract;
//
// async function init() {
//   await zknet.init();
// }
//
// describe("governance", async function () {
//   before(init);
//
//   it("1. deploy cokeErc20", async function () {
//     cokeErc20Contract = await zknet.deployContractToEthereum(
//       zknet.adminWallet,
//       "CokeMgrToken",
//       [100]
//     );
//
//     cokeDexGovernorContract = await zknet.deployContractToEthereum(
//       zknet.adminWallet,
//       "MyGovernor",
//       [cokeErc20Contract.address]
//     );
//   });
//
//   it("2. create a proposal", async function () {
//     const tokenAddr = cokeErc20Contract.address;
//     const teamAddr = "0xa61464658AfeAf65CccaaFD3a512b69A83B77618";
//     const grantAmount = 100;
//     const transferCalldata = cokeErc20Contract.interface.encodeFunctionData(
//       "transfer",
//       [teamAddr, grantAmount]
//     );
//
//     cokeDexGovernorContract
//       .connect(zknet.adminWallet.ethWallet())
//       .on("ProposalCreated", (proposalId, proposer) => {
//         log.info("proposalId: ", proposalId);
//         log.info("proposer: ", proposer);
//
//         cokeDexGovernorContract
//           .connect(zknet.adminWallet.ethWallet())
//           .state(proposalId)
//           .then(function (state: any) {
//             log.info("proposal state is: ", state.toString());
//           });
//       });
//
//     const proposalTx = await cokeDexGovernorContract
//       .connect(zknet.adminWallet.ethWallet())
//       .propose(
//         [tokenAddr],
//         [0],
//         [transferCalldata],
//         "Proposal #1: Give grant to team"
//       );
//
//     await proposalTx.wait();
//
//     await cokeDexGovernorContract
//       .connect(zknet.adminWallet.ethWallet())
//       .hashProposal(
//         [tokenAddr],
//         [0],
//         [transferCalldata],
//         formatBytes32String("Proposal #1: Give grant to team")
//       );
//   });
// });
