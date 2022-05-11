// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import {Types} from "../lib/Types.sol";

contract Storage is AccessControlUpgradeable, ReentrancyGuardUpgradeable {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER");

    // key: trader, token address
    mapping(address => mapping(address => int256)) internal _balance;

    // key: l2 address -> l1 address
    mapping(address => string) internal _bindingAccount;
}
