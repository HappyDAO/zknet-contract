// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {Vault} from "./impl/Vault.sol";
import {Trade} from "./impl/Trade.sol";

contract Perpetual is Initializable, Vault, Trade {
    function initialize() public initializer {}
}
