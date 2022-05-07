// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Storage is Ownable, ReentrancyGuard {
    // key: trader, token address
    mapping(address => mapping(address => int256)) internal _balance;
}
