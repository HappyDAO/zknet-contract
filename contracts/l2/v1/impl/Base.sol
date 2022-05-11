// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {Storage} from "./Storage.sol";

contract Base is Storage {
    modifier onlyOwner() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "AccessControl: caller is not the owner"
        );
        _;
    }

    modifier onlyManager() {
        require(
            hasRole(MANAGER_ROLE, _msgSender()),
            "AccessControl: caller is not the manager"
        );
        _;
    }
}
