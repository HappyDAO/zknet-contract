// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import {Storage} from "./Storage.sol";
import {AccessControl} from "../lib/AccessControl.sol";

contract Base is Storage, AccessControl, ReentrancyGuard {
    function _contractAddress() internal view returns (address) {
        return address(this);
    }
}
