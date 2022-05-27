// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import { Base } from "./Base.sol";
import { IHandleFromL1 } from "../interface/IHandleFromL1.sol";
import { Vault } from "./Vault.sol";
import { Configuration } from "./Configuration.sol";

abstract contract HandleFromL1 is IHandleFromL1, Base, Vault, Configuration {}
