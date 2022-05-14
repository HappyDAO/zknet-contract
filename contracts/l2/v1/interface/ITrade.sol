// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

interface ITrade {
    struct Order {
        uint256 id;
        address trader;
        uint256 positionId;
        uint32 positionToken;
        int256 positionAmount;
        uint256 fee;
        uint32 timestamp;
        bytes signature;
    }

    struct SettlementInfo {
        int256 partAActualAmount;
        int256 partBActualAmount;
        uint256 partAFee;
        uint256 partBFee;
    }

    struct SignedPrice {
        string pk;
        uint256 price;
        uint64 timestamp;
        string signature;
    }

    struct OraclePrice {
        uint32 token;
        uint256 price;
        SignedPrice[] signedPrices;
    }

    struct Indice {
        uint32 token;
        uint256 proce;
    }

    struct DeleverageOrder {
        uint256 positionId;
        uint32 token;
        uint256 sold;
        uint256 fee;
    }

    function settlement(
        Order calldata partA,
        Order calldata partB,
        SettlementInfo calldata settlementInfo
    ) external;

    function oraclePricesTick(OraclePrice[] calldata oraclePrices) external;

    function fundingTick(Indice[] calldata indices) external;

    function liquidate(
        uint256 liquidatedPositionId,
        Order calldata liquidatorOrder,
        SettlementInfo calldata settlementInfo
    ) external;

    function deleverage(
        DeleverageOrder calldata deleveragedOrder,
        DeleverageOrder calldata deleveragerOrder
    ) external;
}
