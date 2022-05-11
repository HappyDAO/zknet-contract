// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {Vault} from "./impl/Vault.sol";
import {Trade} from "./impl/Trade.sol";
import {HandleFromL1} from "./impl/HandleFromL1.sol";

contract Perpetual is Vault, Trade, HandleFromL1 {
    function initialize() public initializer {
        __ReentrancyGuard_init();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
    }
}
