// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
// Importing zkSync contract interface
import "@matterlabs/zksync-contracts/contracts/interfaces/IZkSync.sol";
// Importing `Operations` library which has the `Operations.QueueType` and `Operations.OpTree` types
import "@matterlabs/zksync-contracts/contracts/libraries/Operations.sol";

contract CokeDexGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    constructor(
        IVotes _token,
        uint256 _initialVotingDelay,
        uint256 _initialVotingPeriod,
        uint256 _initialProposalThreshold
    )
        Governor("CokeDexGovernor")
        GovernorSettings(_initialVotingDelay, _initialVotingPeriod, _initialProposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
    {}

    // The following functions are overrides required by Solidity.

    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function callZkSync(
        address zkSyncAddress,
        address contractAddr,
        bytes memory data,
        uint64 ergsLimit
    ) external payable {
        require(msg.sender == address(this), "Only governor is allowed");

        IZkSync zksync = IZkSync(zkSyncAddress);
        // Note that we pass the value as the fee for executing the transaction
        zksync.requestExecute{ value: msg.value }(
            contractAddr,
            data,
            ergsLimit,
            Operations.QueueType.Deque,
            Operations.OpTree.Full
        );
    }
}
