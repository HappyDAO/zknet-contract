// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {ITrade} from "../interface/ITrade.sol";
import {Base} from "./Base.sol";

contract Trade is ITrade, Base {
    function settlement(
        Order calldata partA,
        Order calldata partB,
        SettlementInfo calldata settlementInfo
    ) external override onlyManager {}

    function oraclePricesTick(OraclePrice[] calldata oraclePrices)
        external
        override
        onlyManager
    {}

    function fundingTick(Indice[] calldata indices)
        external
        override
        onlyManager
    {}

    function liquidate(
        uint256 liquidatedPositionId,
        Order calldata liquidatorOrder,
        SettlementInfo calldata settlementInfo
    ) external override onlyManager {}

    function deleverage(
        DeleverageOrder calldata deleveragedOrder,
        DeleverageOrder calldata deleveragerOrder
    ) external override onlyManager {}
}
