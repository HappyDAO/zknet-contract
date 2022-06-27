// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

library Types {
    struct Position {
        uint64 id;
        address owner;
        int256 marginAmount;
        uint32 marginToken;
        int256 positionAmount;
        uint32 positionToken;
        uint256 openPrice;
        uint32 openTimestamp;
        Index cacheIndex;
    }

    struct Order {
        uint256 id;
        address trader;
        uint64 positionId;
        uint32 positionToken;
        int256 positionAmount;
        int256 remainAmount;
        uint256 fee;
        uint32 timestamp;
        bytes signature;
    }

    struct Index {
        uint32 timestamp;
        uint256 price;
    }

    struct OraclePrice {
        uint32 timestamp;
        uint256 price;
    }
}
