// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import {Types} from "../lib/Types.sol";
import {Storage} from "./Storage.sol";
import {AccessControl} from "../lib/AccessControl.sol";

contract Base is Storage, AccessControl, ReentrancyGuard {
    function _contractAddress() internal view returns (address) {
        return address(this);
    }

    function _existToken(uint32 assetId) internal view returns (bool) {
        return _token[assetId] != address(0);
    }

    function _tokenAddress(uint32 tokenId) internal view returns (address) {
        address tokenAddr = _token[tokenId];
        require(tokenAddr != address(0), "Base: unregistered token");
        return tokenAddr;
    }

    function _getAndCheckPosition(uint256 positionId, address owner)
        internal
        view
        returns (Types.Position memory)
    {
        Types.Position memory position = _position[positionId];
        require(position.id != 0, "Base: position not exist");
        require(position.owner == owner, "Base: not position owner");
        return position;
    }
}
