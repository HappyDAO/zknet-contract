// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

interface ITrade {
    struct Order {
        address addr;
        uint256 positionId;
        uint64 timestamp;
        address tokenBuy;
        address tokenSell;
        uint256 amountBuy;
        uint256 amountSell;
        uint256 fee;
        string extend;
        string signature;
    }

    struct SettlementInfo {
        uint256 partASold;
        uint256 partBSold;
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
        address token;
        uint256 price;
        SignedPrice[] signedPrices;
    }

    struct Indice {
        address token;
        uint256 proce;
    }

    struct DeleverageOrder {
        uint256 positionId;
        address token;
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
