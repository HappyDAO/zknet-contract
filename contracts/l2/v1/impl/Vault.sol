// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "hardhat/console.sol";

import {Base} from "./Base.sol";
import {IVault} from "../interface/IVault.sol";

contract Vault is IVault, Base {
    function mint(address token, int256 amount) public onlyManager{
        _balance[msg.sender][token] += amount;
    }

    function balance(address token) public view returns (int256) {
        return _balance[msg.sender][token];
    }

    function bind(SignedAccount calldata l1Account) external override {
        
    }

    function deposit(address token, uint256 amount) external override {
        
    }

    function withdraw(address token, uint256 amount) external override {
        
    }

    function positionDeposit(
        uint256 positionId,
        address token,
        uint256 amount
    ) external override {}

    function positionWithdraw(
        uint256 positionId,
        address token,
        uint256 amount
    ) external override {}

    function transfer(
        address to,
        address token,
        uint256 amount,
        uint256 fee
    ) external override {}
}
