// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

/**
 * @title IVault
 * @author zknet
 *
 * @notice Interface for Vault, manage user assets.
 */
interface IVault {
    /// @dev Signed account structure based on EIP712.
    struct SignedAccount {
        string addr;
        string timestamp;
        string signature;
    }

    /// @notice Emitted when L1 and L2 account bind.
    /// @param addrL1  L1 account address
    /// @param addrL2  L2 account address
    event LogBind(string addrL1, string addrL2);

    /// @notice Emitted when trader deposit from L2.
    /// @param token Token id
    /// @param account  Account address
    /// @param amount  Token amount
    event LogDeposit(uint32 indexed token, address indexed account, uint256 amount);

    /// @notice Emitted when trader withdrawn to L2.
    /// @param token  Token id
    /// @param account  Account address
    /// @param amount  Token amount
    event LogWithdrawn(uint32 indexed token, address indexed account, uint256 amount);

    /// @notice Emitted when trader transfer token from account balance to designated position for margin.
    /// @param positionId  Position id
    /// @param token  Token id
    /// @param account  Account address
    /// @param amount  Token amount
    event LogPositionDeposit(uint64 indexed positionId, uint32 indexed token, address indexed account, uint256 amount);

    /// @notice Emitted when trader transfer token from designated position to account balance.
    /// @dev Currently, only withdrawn after closing positions are supported.
    /// @param positionId  Position id
    /// @param token  Token id
    /// @param account  Account address
    /// @param amount  Token amount
    event LogPositionWithdrawn(
        uint64 indexed positionId,
        uint32 indexed token,
        address indexed account,
        uint256 amount
    );

    /// @notice Emitted when `value` tokens are moved from one account (`from`) to another (`to`).
    /// @param from    From account address
    /// @param to      To account address
    /// @param token   Token id
    /// @param amount  Token amount
    event LogTransfer(address from, address to, uint32 token, uint256 amount);

    function bind(SignedAccount calldata l1Account) external;

    function balanceOf(address account, uint32 token) external view returns (int256);

    function deposit(uint32 token, uint256 amount) external;

    function withdraw(uint32 token, uint256 amount) external;

    function positionDeposit(
        uint64 positionId,
        uint32 token,
        uint256 amount
    ) external;

    function positionWithdraw(
        uint64 positionId,
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
