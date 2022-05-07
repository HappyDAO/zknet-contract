// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {ITrade} from "../interface/ITrade.sol";
import {Storage} from "./Storage.sol";

contract Trade is ITrade, Storage {
    function settlement(
        Order calldata partA,
        Order calldata partB,
        SettlementInfo calldata settlementInfo
    ) external override {}

    function oraclePricesTick(OraclePrice[] calldata oraclePrices)
        external
        override
    {}

    function fundingTick(Indice[] calldata indices) external override {}

    function liquidate(
        uint256 liquidatedPositionId,
        Order calldata liquidatorOrder,
        SettlementInfo calldata settlementInfo
    ) external override {}

    function deleverage(
        DeleverageOrder calldata deleveragedOrder,
        DeleverageOrder calldata deleveragerOrder
    ) external override {}
}
