// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import {Base} from "./Base.sol";
import {IConfiguration} from "../interface/IConfiguration.sol";

contract Configuration is IConfiguration, Base {
    function registerToken(address token, uint32 tokenId)
        external
        override
        onlyManager
    {
        require(token != address(0), "Configuration: token address is nil");
        require(
            !_existToken(tokenId),
            "Configuration: token id is already used"
        );
        _token[tokenId] = token;
    }
}
