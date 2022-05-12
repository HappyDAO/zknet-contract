// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {Base} from "./Base.sol";
import {IVault} from "../interface/IVault.sol";

contract Vault is IVault, Base {
    function balance(address token) public view returns (int256) {
        return _balance[msg.sender][token];
    }

    function bind(SignedAccount calldata l1Account) external override {}

    function deposit(address token, uint256 amount)
        external
        override
        nonReentrant
    {
        SafeERC20.safeTransferFrom(
            IERC20(token),
            _msgSender(),
            _contractAddress(),
            amount
        );
        _balance[_msgSender()][token] += int256(amount);
    }

    function withdraw(address token, uint256 amount)
        external
        override
        nonReentrant
    {
        require(
            _balance[_msgSender()][token] >= int256(amount),
            "Vault: insufficient balance"
        );
        _balance[_msgSender()][token] -= int256(amount);
        SafeERC20.safeTransfer(IERC20(token), _msgSender(), amount);
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
