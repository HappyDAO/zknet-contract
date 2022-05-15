// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {Vault} from "./impl/Vault.sol";
import {Trade} from "./impl/Trade.sol";
import {HandleFromL1} from "./impl/HandleFromL1.sol";

contract Perpetual is Vault, Trade, HandleFromL1 {
    constructor() {
    }
}
