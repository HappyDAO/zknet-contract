// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import { Types } from "../lib/Types.sol";
import { Storage } from "./Storage.sol";
import { AccessControl } from "../lib/AccessControl.sol";
import { ChainId } from "../lib/ChainId.sol";

abstract contract Base is Storage, AccessControl, ReentrancyGuard {
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

    function _getAndCheckPosition(uint64 positionId, address owner) internal view returns (Types.Position memory) {
        Types.Position memory position = _position[positionId];
        require(position.id != 0, "Base: position not exist");
        require(position.owner == owner, "Base: not position owner");
        return position;
    }

    function domainSeparator() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                    0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f,
                    _nameHash,
                    _versionHash,
                    ChainId.get(),
                    _contractAddress()
                )
            );
    }

    function _splitSignature(bytes memory sig)
        internal
        pure
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }
}
