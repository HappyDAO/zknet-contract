// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import { Types } from "../lib/Types.sol";

contract Storage {
    // token id => token address(erc20), reduce storage
    mapping(uint32 => address) internal _token;

    // trader => asset id
    mapping(address => mapping(uint32 => int256)) internal _balance;

    // l2 address => l1 address
    mapping(address => address) internal _bindingAccount;

    // position id => position
    mapping(uint64 => Types.Position) internal _position;

    // order id => order
    mapping(uint256 => Types.Order) internal _order;

    // TODO:不同的合约不同的配置参数，价格
}
