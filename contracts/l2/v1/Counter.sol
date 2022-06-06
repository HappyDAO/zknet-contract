//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Counter {
    uint256 public value = 0;
    address public governance;

    constructor(address newGovernance) {
        governance = newGovernance;
    }

    function increment(uint256 add) public {
        require(msg.sender == governance, "Only governance is allowed");

        value += add;
    }
}
