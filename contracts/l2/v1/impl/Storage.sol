// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import { Types } from "../lib/Types.sol";

contract Storage {
    /// @dev token id => token address(erc20), reduce storage
    mapping(uint32 => address) internal _token;

    /// @dev trader => asset id
    mapping(address => mapping(uint32 => int256)) internal _balance;

    /// @dev l2 address => l1 address
    mapping(address => address) internal _bindingAccount;

    /// @dev position id => position
    mapping(uint64 => Types.Position) internal _position;

    /// @dev order id => order
    mapping(uint256 => Types.Order) internal _order;

    /// @dev position token id => index
    mapping(uint32 => Types.Index) internal _global_index;

    /// @dev position token id => oracle price
    mapping(uint32 => Types.OraclePrice) internal _global_oracle_price;

    /// @dev The hash of the name used in the permit signature verification
    bytes32 internal immutable _nameHash;

    /// @dev The hash of the version string used in the permit signature verification
    bytes32 internal immutable _versionHash;

    /// @dev Value is equal to keccak256( "Order(uint256 id,address trader,uint64 positionId,uint32 positionToken,int256 positionAmount,uint256 fee,uint32 timestamp)");
    bytes32 internal constant _ORDER_TYPEHASH =
        keccak256(
            "Order(uint256 id,string typ,address trader,uint64 positionId,uint32 positionToken,int256 positionAmount,uint256 limitPrice,uint256 triggerPrice,uint256 fee,uint32 timestamp)"
        );

    // TODO:不同的合约不同的配置参数，价格

    constructor(string memory name, string memory version) {
        _nameHash = keccak256(bytes(name));
        _versionHash = keccak256(bytes(version));

        //  eth
        _token[0] = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        // usdt, as margin token
        _token[1] = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    }
}
