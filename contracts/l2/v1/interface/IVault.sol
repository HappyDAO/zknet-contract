// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

interface IVault {
    struct SignedAccount {
        string addr;
        string timestamp;
        string signature;
    }

    event Deposited(
        uint32 indexed token,
        address indexed trader,
        uint256 amount
    );

    event Withdrawn(
        uint32 indexed token,
        address indexed trader,
        uint256 amount
    );

    event PositionDeposited(
        uint256 indexed positionId,
        uint32 indexed token,
        address indexed trader,
        uint256 amount
    );

    event PositionWithdrawn(
        uint256 indexed positionId,
        uint32 indexed token,
        address indexed trader,
        uint256 amount
    );

    event Transfer(address from, address to, uint32 token, uint256 amount);

    function bind(SignedAccount calldata l1Account) external;

    function deposit(uint32 token, uint256 amount) external;

    function withdraw(uint32 token, uint256 amount) external;

    function positionDeposit(
        uint256 positionId,
        uint32 token,
        uint256 amount
    ) external;

    function positionWithdraw(
        uint256 positionId,
        uint32 token,
        uint256 amount
    ) external;

    function transfer(
        address to,
        uint32 token,
        uint256 amount,
        uint256 fee
    ) external;
}
