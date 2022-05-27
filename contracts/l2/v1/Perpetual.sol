// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import { Storage } from "./impl/Storage.sol";
import { Vault } from "./impl/Vault.sol";
import { Trade } from "./impl/Trade.sol";
import { HandleFromL1 } from "./impl/HandleFromL1.sol";

contract Perpetual is Storage, Vault, Trade, HandleFromL1 {
    constructor(string memory name, string memory version) Storage(name, version) {}
}
