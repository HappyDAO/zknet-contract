// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {Types} from "../lib/Types.sol";

contract Storage {
    // key: trader, token address
    mapping(address => mapping(address => int256)) internal _balance;

    // key: l2 address -> l1 address
    mapping(address => string) internal _bindingAccount;

    
}
