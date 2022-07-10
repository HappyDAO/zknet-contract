// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import { Types } from "../lib/Types.sol";
import { Base } from "./Base.sol";
import { Storage } from "./Storage.sol";
import { IVault } from "../interface/IVault.sol";

abstract contract Vault is IVault, Storage, Base {
    using SafeMath for uint256;

    function tokenAddress(uint32 token) external view returns (address) {
        return _token[token];
    }

    function balanceOf(address account, uint32 token) external view override returns (int256) {
        return _balance[account][token];
    }

    function positionMarginBalanceOf(uint64 positionId) external view returns (int256) {
        return _position[positionId].marginAmount;
    }

    function positionBalanceOf(uint64 positionId) external view returns (int256) {
        return _position[positionId].positionAmount;
    }

    function bind(SignedAccount calldata l1Account) external override {}

    function devDeposit(uint32 token, uint256 amount) external {
        _balance[_msgSender()][token] += int256(amount);
    }

    function deposit(uint32 token, uint256 amount) external override nonReentrant {
        address tokenAddr = _tokenAddress(token);
        SafeERC20.safeTransferFrom(IERC20(tokenAddr), _msgSender(), _contractAddress(), amount);
        _balance[_msgSender()][token] += int256(amount);
        emit LogDeposit(token, _msgSender(), amount);
    }

    function withdraw(uint32 token, uint256 amount) external override nonReentrant {
        address tokenAddr = _tokenAddress(token);
        require(_balance[_msgSender()][token] >= int256(amount), "Vault: insufficient balance");
        _balance[_msgSender()][token] -= int256(amount);
        SafeERC20.safeTransfer(IERC20(tokenAddr), _msgSender(), amount);
        emit LogWithdrawn(token, _msgSender(), amount);
    }

    function positionDeposit(
        uint64 positionId,
        uint32 token,
        uint256 amount
    ) external override nonReentrant {
        require(token == 1, "Vault: position margin token only support USDT[token-id:1]");
        require(positionId != 0, "Vault: position id cannot be 0");
        require(_balance[_msgSender()][token] >= int256(amount), "Vault: insufficient balance");

        Types.Position memory position = _position[positionId];
        _settlePosition(position);
        if (position.id == 0) {
            position.id = positionId;
            position.owner = _msgSender();
            position.marginAmount = int256(amount);
            position.marginToken = token;
        } else {
            require(position.owner == _msgSender(), "Vault: not position owner");
            require(position.marginToken == token, "Vault: margin token not match");
            require(position.marginAmount >= 0, "Vault: negative margin amount");
            position.marginAmount += int256(amount);
        }

        _position[positionId] = position;
        _balance[_msgSender()][token] -= int256(amount);

        emit LogPositionDeposit(positionId, token, _msgSender(), amount);
    }

    function positionWithdraw(
        uint64 positionId,
        uint32 token,
        uint256 amount
    ) external override nonReentrant {
        Types.Position memory position = _getAndCheckPosition(positionId, _msgSender());
        _settlePosition(position);

        require(position.marginToken == token, "Vault: margin token not match");
        require(position.marginAmount >= int256(amount), "Vault: insufficient margin balance");
        // TODO: check whether the margin can maintain the position
        position.marginAmount -= int256(amount);
        _position[positionId] = position;
        _balance[_msgSender()][token] += int256(amount);

        _checkPosition(position);

        emit LogPositionWithdrawn(positionId, token, _msgSender(), amount);
    }

    function transfer(
        address to,
        uint32 token,
        uint256 amount,
        uint256 fee
    ) external override nonReentrant {
        require(_balance[_msgSender()][token] >= int256(amount), "Vault: insufficient balance");

        // TODO: process fee

        _balance[_msgSender()][token] -= int256(amount);
        _balance[to][token] += int256(amount);

        emit LogTransfer(_msgSender(), to, token, amount);
    }
}
