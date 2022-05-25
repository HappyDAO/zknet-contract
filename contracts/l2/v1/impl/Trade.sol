// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import { ITrade } from "../interface/ITrade.sol";
import { Base } from "./Base.sol";
import { Types } from "../lib/Types.sol";

contract Trade is ITrade, Base {
    struct SettlementInfoExtend {
        int256 partAActualAmount;
        int256 partBActualAmount;
        uint256 partAFee;
        uint256 partBFee;
    }

    function _checkOrder(Order calldata order, int256 actualAmount) internal pure {
        require(order.id != 0, "Trade: order id cannot be 0");
        require(order.positionAmount != 0, "Trade: order position amount cannot be 0");

        if (order.positionAmount < 0) {
            require(actualAmount < 0, "Trade: order position amount and actual amount not match");
            require(actualAmount >= order.positionAmount, "Trade: order position amount and actual amount not match");
        } else {
            require(actualAmount > 0, "Trade: order position amount and actual amount not match");
            require(actualAmount <= order.positionAmount, "Trade: order position amount and actual amount not match");
        }
        // TODO: verfy signature
    }

    function _checkRepeatSettlement(Types.Order memory existedOrder, int256 actualAmount) internal pure {
        if (existedOrder.id != 0) {
            if (existedOrder.positionAmount < 0) {
                require(actualAmount >= existedOrder.remainAmount, "Trade: repeated settlement");
            } else {
                require(actualAmount <= existedOrder.remainAmount, "Trade: repeated settlement");
            }
        }
    }

    function _checkSettlement(
        Types.Order memory existedOrderA,
        Order calldata partA,
        Types.Order memory existedOrderB,
        Order calldata partB,
        SettlementInfoExtend memory settlementInfo
    ) internal pure {
        _checkOrder(partA, settlementInfo.partAActualAmount);
        _checkRepeatSettlement(existedOrderA, settlementInfo.partAActualAmount);

        _checkOrder(partB, settlementInfo.partBActualAmount);
        _checkRepeatSettlement(existedOrderB, settlementInfo.partBActualAmount);
        require(partA.positionToken == partB.positionToken, "Trade: orders token not match");
        require(
            (partA.positionAmount > 0 && partB.positionAmount < 0) ||
                (partA.positionAmount < 0 && partB.positionAmount > 0),
            "Trade: order side not match"
        );
    }

    function _checkPositionMatch(
        Types.Order memory existedOrder,
        Order calldata order,
        Types.Position memory position
    ) internal pure {
        if (position.positionToken == 0) {
            position.positionToken = order.positionToken;
        } else {
            require(order.positionToken == position.positionToken, "Trade: order token position token not match");
        }
        if (existedOrder.id != 0) {
            require(
                keccak256(existedOrder.signature) == keccak256(order.signature),
                "Trade: order signature not match"
            );
        } else {
            existedOrder.id = order.id;
            existedOrder.trader = order.trader;
            existedOrder.positionId = order.positionId;
            existedOrder.positionToken = order.positionToken;
            existedOrder.positionAmount = order.positionAmount;
            existedOrder.remainAmount = order.positionAmount;
            existedOrder.fee = order.fee;
            existedOrder.timestamp = order.timestamp;
            existedOrder.signature = order.signature;
        }
    }

    function _settlement(
        SettlementInfoExtend memory settlementInfo,
        Types.Position memory positionA,
        Types.Order memory existedOrderA,
        Types.Position memory positionB,
        Types.Order memory existedOrderB
    ) internal {
        // TODO: process fee
        existedOrderA.remainAmount -= settlementInfo.partAActualAmount;
        existedOrderB.remainAmount -= settlementInfo.partBActualAmount;
        positionA.positionAmount += settlementInfo.partAActualAmount;
        positionB.positionAmount += settlementInfo.partBActualAmount;

        _order[existedOrderA.id] = existedOrderA;
        _order[existedOrderB.id] = existedOrderB;
        _position[positionA.id] = positionA;
        _position[positionB.id] = positionB;
    }

    function settlement(
        Order calldata partA,
        Order calldata partB,
        SettlementInfo calldata settlementInfo
    ) external override onlyManager nonReentrant {
        int256 partAActualAmount = int256(settlementInfo.positionSold);
        int256 partBActualAmount = int256(settlementInfo.positionSold);
        if (partA.positionAmount < 0) {
            partAActualAmount = -partAActualAmount;
        }
        if (partB.positionAmount < 0) {
            partBActualAmount = -partBActualAmount;
        }

        SettlementInfoExtend memory settlementInfoExtend = SettlementInfoExtend(
            partAActualAmount,
            partBActualAmount,
            settlementInfo.partAFee,
            settlementInfo.partBFee
        );

        Types.Order memory existedOrderA = _order[partA.id];
        Types.Order memory existedOrderB = _order[partB.id];
        _checkSettlement(existedOrderA, partA, existedOrderB, partB, settlementInfoExtend);

        Types.Position memory positionA = _getAndCheckPosition(partA.positionId, partA.trader);
        _checkPositionMatch(existedOrderA, partA, positionA);

        Types.Position memory positionB = _getAndCheckPosition(partB.positionId, partB.trader);
        _checkPositionMatch(existedOrderB, partB, positionB);

        _settlement(settlementInfoExtend, positionA, existedOrderA, positionB, existedOrderB);
    }

    function oraclePricesTick(OraclePrice[] calldata oraclePrices) external override onlyManager {}

    function fundingTick(Indice[] calldata indices) external override onlyManager {}

    function liquidate(
        uint64 liquidatedPositionId,
        Order calldata liquidatorOrder,
        SettlementInfo calldata settlementInfo
    ) external override onlyManager {}

    function deleverage(DeleverageOrder calldata deleveragedOrder, DeleverageOrder calldata deleveragerOrder)
        external
        override
        onlyManager
    {}
}
