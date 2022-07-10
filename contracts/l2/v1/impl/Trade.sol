// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import { ITrade } from "../interface/ITrade.sol";
import { Base } from "./Base.sol";
import { Types } from "../lib/Types.sol";
import { ChainId } from "../lib/ChainId.sol";
import { Storage } from "./Storage.sol";

abstract contract Trade is ITrade, Storage, Base {
    using SafeMath for uint256;

    struct SettlementInfoExtend {
        int256 partAActualAmount;
        int256 partBActualAmount;
        uint256 partAFee;
        uint256 partBFee;
        uint256 price;
    }

    function _verifyOrder(Order calldata order) internal view {
        uint8 v;
        bytes32 r;
        bytes32 s;
        (v, r, s) = _splitSignature(order.signature);

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator(),
                keccak256(
                    abi.encode(
                        _ORDER_TYPEHASH,
                        order.id,
                        keccak256(bytes(order.typ)),
                        order.trader,
                        order.positionId,
                        order.positionToken,
                        order.positionAmount,
                        order.limitPrice,
                        order.triggerPrice,
                        order.fee,
                        order.timestamp
                    )
                )
            )
        );

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0), "Trade: invalid order signature");
        require(recoveredAddress == order.trader, "Trade: unauthorized order");
    }

    function _checkOrder(Order calldata order, int256 actualAmount) internal view {
        //  verfy signature
        _verifyOrder(order);

        require(order.id != 0, "Trade: order id cannot be 0");
        require(order.positionAmount != 0, "Trade: order position amount cannot be 0");

        if (order.positionAmount < 0) {
            require(actualAmount < 0, "Trade: order position amount and actual amount not match");
            require(actualAmount >= order.positionAmount, "Trade: order position amount and actual amount not match");
        } else {
            require(actualAmount > 0, "Trade: order position amount and actual amount not match");
            require(actualAmount <= order.positionAmount, "Trade: order position amount and actual amount not match");
        }
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
    ) internal view {
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

    function _calOpenPrice(
        uint256 price,
        int256 settlementAmount,
        Types.Position memory position
    ) internal pure returns (uint256) {
        if (settlementAmount + position.positionAmount == 0) {
            return 0;
        }
        int256 totalValue = (int256(position.openPrice) * position.positionAmount) + (settlementAmount * int256(price));
        return int256Abs(totalValue / (settlementAmount + position.positionAmount));
    }

    function _calProfit(
        uint256 price,
        int256 settlementAmount,
        Types.Position memory position
    ) internal pure returns (int256) {
        if (position.positionAmount == 0) {
            return 0;
        }
        int256 detail = 0;
        if (
            (position.positionAmount > 0 && settlementAmount < 0) ||
            (position.positionAmount < 0 && settlementAmount > 0)
        ) {
            detail = int256(position.openPrice) - int256(price);
        }
        return detail * settlementAmount;
    }

    function _settlement(
        SettlementInfoExtend memory settlementInfo,
        Types.Position memory positionA,
        Types.Order memory existedOrderA,
        Types.Position memory positionB,
        Types.Order memory existedOrderB
    ) internal {
        positionA.marginAmount += _calProfit(settlementInfo.price, settlementInfo.partAActualAmount, positionA);
        positionB.marginAmount += _calProfit(settlementInfo.price, settlementInfo.partBActualAmount, positionB);

        positionA.openPrice = _calOpenPrice(settlementInfo.price, settlementInfo.partAActualAmount, positionA);
        positionB.openPrice = _calOpenPrice(settlementInfo.price, settlementInfo.partBActualAmount, positionB);

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
        } else {
            partBActualAmount = -partBActualAmount;
        }

        uint256 price = 0;
        if (partA.limitPrice < partB.limitPrice) {
            price = partA.limitPrice;
        } else {
            price = partB.limitPrice;
        }

        SettlementInfoExtend memory settlementInfoExtend = SettlementInfoExtend(
            partAActualAmount,
            partBActualAmount,
            settlementInfo.partAFee,
            settlementInfo.partBFee,
            price
        );

        Types.Order memory existedOrderA = _order[partA.id];
        Types.Order memory existedOrderB = _order[partB.id];
        _checkSettlement(existedOrderA, partA, existedOrderB, partB, settlementInfoExtend);

        Types.Position memory positionA = _getAndCheckPosition(partA.positionId, partA.trader);
        _checkPositionMatch(existedOrderA, partA, positionA);

        Types.Position memory positionB = _getAndCheckPosition(partB.positionId, partB.trader);
        _checkPositionMatch(existedOrderB, partB, positionB);

        _settlePosition(positionA);
        _settlePosition(positionB);
        _settlement(settlementInfoExtend, positionA, existedOrderA, positionB, existedOrderB);

        _checkPosition(positionA);
        _checkPosition(positionB);
    }

    function oraclePricesTick(OraclePrice[] calldata oraclePrices) external override onlyManager {
        uint256 num = oraclePrices.length;
        for (uint256 i = 0; i < num; i++) {
            OraclePrice memory oraclePrice = oraclePrices[i];
            _global_oracle_price[oraclePrice.token] = Types.OraclePrice({
                timestamp: oraclePrice.timestamp,
                price: oraclePrice.price
            });
        }
    }

    function fundingTick(Index[] calldata indexes) external override onlyManager {
        uint256 num = indexes.length;
        for (uint256 i = 0; i < num; i++) {
            Index memory index = indexes[i];
            _global_index[index.token] = Types.Index({ timestamp: index.timestamp, price: index.price });
        }
    }

    function liquidate(
        uint64 liquidatedPositionId,
        Order calldata liquidatorOrder,
        SettlementInfo calldata settlementInfo
    ) external override onlyManager {
        Types.Position memory positionA = _position[liquidatedPositionId];
        require(positionA.id != 0, "Trade: position not exist");
        require(settlementInfo.positionSold <= int256Abs(positionA.positionAmount), "Trade: settlement too much");
        require(_checkPositionIsZero(positionA), "Trade: position can not be liquidated");

        int256 partAActualAmount = int256(settlementInfo.positionSold);
        int256 partBActualAmount = int256(settlementInfo.positionSold);
        if (liquidatorOrder.positionAmount < 0) {
            if (positionA.positionAmount > 0) {
                revert("Trade: order side not match");
            }
            partBActualAmount = -partBActualAmount;
        } else {
            if (positionA.positionAmount < 0) {
                revert("Trade: order side not match");
            }
            partAActualAmount = -partAActualAmount;
        }

        uint256 price = liquidatorOrder.limitPrice;
        SettlementInfoExtend memory settlementInfoExtend = SettlementInfoExtend(
            partAActualAmount,
            partBActualAmount,
            settlementInfo.partAFee,
            settlementInfo.partBFee,
            price
        );

        Types.Order memory existedOrderB = _order[liquidatorOrder.id];
        Types.Position memory positionB = _getAndCheckPosition(liquidatorOrder.positionId, liquidatorOrder.trader);
        _checkPositionMatch(existedOrderB, liquidatorOrder, positionB);

        _settlePosition(positionA);
        _settlePosition(positionB);

        positionA.marginAmount += _calProfit(
            settlementInfoExtend.price,
            settlementInfoExtend.partAActualAmount,
            positionA
        );
        positionB.marginAmount += _calProfit(
            settlementInfoExtend.price,
            settlementInfoExtend.partBActualAmount,
            positionB
        );

        positionA.openPrice = _calOpenPrice(
            settlementInfoExtend.price,
            settlementInfoExtend.partAActualAmount,
            positionA
        );
        positionB.openPrice = _calOpenPrice(
            settlementInfoExtend.price,
            settlementInfoExtend.partBActualAmount,
            positionB
        );

        // TODO: process fee
        existedOrderB.remainAmount -= settlementInfoExtend.partBActualAmount;
        positionA.positionAmount += settlementInfoExtend.partAActualAmount;
        positionB.positionAmount += settlementInfoExtend.partBActualAmount;

        _order[existedOrderB.id] = existedOrderB;
        _position[positionA.id] = positionA;
        _position[positionB.id] = positionB;

        printPosition(positionA.id);
        printPosition(positionB.id);

        _checkPosition(positionA);
        _checkPosition(positionB);
    }

    function deleverage(DeleverageOrder calldata deleveragedOrder, DeleverageOrder calldata deleveragerOrder)
        external
        override
        onlyManager
    {}
}
