// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

/**
 * @title ITrade
 * @author zknet
 *
 * @notice Interface for Trade, manage contract trade.
 */
interface ITrade {
    struct Order {
        uint256 id;
        string typ;
        address trader;
        uint64 positionId;
        uint32 positionToken;
        int256 positionAmount;
        uint256 limitPrice;
        uint256 triggerPrice;
        uint256 fee;
        string extend;
        uint32 timestamp;
        bytes signature;
    }

    struct SettlementInfo {
        uint256 positionSold;
        uint256 partAFee;
        uint256 partBFee;
    }

    struct SignedPrice {
        string pk;
        uint256 price;
        uint32 timestamp;
        string signature;
    }

    struct OraclePrice {
        uint32 token;
        uint256 price;
        uint32 timestamp;
        SignedPrice[] signedPrices;
    }

    struct Index {
        uint32 token;
        uint256 price;
        uint32 timestamp;
    }

    struct DeleverageOrder {
        uint64 positionId;
        uint256 sold;
        uint256 fee;
    }

    /// @notice Emitted when order settlement, including open-position and close-position(active or passive).
    /// @param positionId      Position id
    /// @param typ             change reason: 0-funding, 1-inc position, 1-dec position, 2-liquidate, 2-deleverage
    /// @param marginAmount    Margin remain amount
    /// @param positionAmount  Position remain amount
    event LogPositionChange(uint64 indexed positionId, uint8 typ, uint256 marginAmount, uint256 positionAmount);

    function settlement(
        Order calldata partA,
        Order calldata partB,
        SettlementInfo calldata settlementInfo
    ) external;

    function oraclePricesTick(OraclePrice[] calldata oraclePrices) external;

    function fundingTick(Index[] calldata indexes) external;

    function liquidate(
        uint64 liquidatedPositionId,
        Order calldata liquidatorOrder,
        SettlementInfo calldata settlementInfo
    ) external;

    function deleverage(DeleverageOrder calldata deleveragedOrder, DeleverageOrder calldata deleveragerOrder) external;
}
