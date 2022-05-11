// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {IHandleFromL1} from "../interface/IHandleFromL1.sol";
import {Storage} from "./Storage.sol";
import {Vault} from "./Vault.sol";
import {Configuration} from "./Configuration.sol";

contract HandleFromL1 is IHandleFromL1, Storage, Vault, Configuration {
    
    
}
