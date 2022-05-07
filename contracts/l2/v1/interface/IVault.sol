// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

interface IVault {
    struct SignedAccount {
        string addr;
        string timestamp;
        string signature;
    }

    event Deposited(
        address indexed token,
        address indexed trader,
        uint256 amount
    );

    event Withdrawn(
        address indexed token,
        address indexed trader,
        uint256 amount
    );

    event PositionDeposited(
        uint256 indexed positionId,
        address indexed token,
        address indexed trader,
        uint256 amount
    );

    event PositionWithdrawn(
        uint256 indexed positionId,
        address indexed token,
        address indexed trader,
        uint256 amount
    );

    event Transfer(address from, address to, address token, uint256 amount);

    function bind(SignedAccount calldata l1Account) external;

    function deposit(address token, uint256 amount) external;

    function withdraw(address token, uint256 amount) external;

    function positionDeposit(
        uint256 positionId,
        address token,
        uint256 amount
    ) external;

    function positionWithdraw(
        uint256 positionId,
        address token,
        uint256 amount
    ) external;

    function transfer(
        address to,
        address token,
        uint256 amount,
        uint256 fee
    ) external;
}
