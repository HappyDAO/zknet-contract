// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

contract Types {
    struct Position {
        address owner;
        bool marginIsPositive;
        bool positionIsPositive;
        uint256 margin;
        uint256 position;
    }
}
