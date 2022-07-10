// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "hardhat/console.sol";

import { Types } from "../lib/Types.sol";
import { Storage } from "./Storage.sol";
import { AccessControl } from "../lib/AccessControl.sol";
import { ChainId } from "../lib/ChainId.sol";

abstract contract Base is Storage, AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    function devSettlePosition(uint64 positionId) public {
        Types.Position memory position = _position[positionId];
        require(position.id != 0, "Trade: position not exist");
        _settlePosition(position);
    }

    function printPosition(uint64 positionId) public view {
        Types.Position memory position = _position[positionId];
        require(position.id != 0, "Trade: position not exist");
        // console.log("position id: ", position.id);
        // console.log("marginAmount: ");
        // console.logInt(position.marginAmount);
        // console.log("positionAmount: ");
        // console.logInt(position.positionAmount);
        // console.log("openPrice: ", position.openPrice);
        // console.log("cacheIndex.price: ", position.cacheIndex.price);
        // console.log("");
    }

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
                    1,
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

    function _checkPosition(Types.Position memory position) internal view {
        if (_checkPositionIsNegative(position)) {
            revert("Vault: Insufficient margin");
        }
    }

    function _checkPositionIsNegative(Types.Position memory position) internal view returns (bool) {
        if (position.positionAmount == 0) {
            return false;
        }

        if (position.marginAmount < 0) {
            return true;
        }

        uint256 currentPrice = _global_oracle_price[position.positionToken].price;

        if (currentPrice == position.openPrice) {
            return false;
        }
        uint256 detail;
        if (currentPrice > position.openPrice) {
            if (position.positionAmount > 0) {
                return false;
            }
            detail = currentPrice.sub(position.openPrice);
        } else {
            if (position.positionAmount < 0) {
                return false;
            }
            detail = position.openPrice.sub(currentPrice);
        }

        uint256 marginAmount = uint256(position.marginAmount);
        uint256 positionAmount = int256Abs(position.positionAmount);
        if (detail.mul(positionAmount) > marginAmount) {
            return true;
        }
        return false;
    }

    function _checkPositionIsZero(Types.Position memory position) internal view returns (bool) {
        if (position.positionAmount == 0) {
            return false;
        }

        if (position.marginAmount < 0) {
            return true;
        }

        uint256 currentPrice = _global_oracle_price[position.positionToken].price;

        if (currentPrice == position.openPrice) {
            return false;
        }
        uint256 detail;
        if (currentPrice > position.openPrice) {
            if (position.positionAmount > 0) {
                return false;
            }
            detail = currentPrice.sub(position.openPrice);
        } else {
            if (position.positionAmount < 0) {
                return false;
            }
            detail = position.openPrice.sub(currentPrice);
        }

        uint256 marginAmount = uint256(position.marginAmount);
        uint256 positionAmount = int256Abs(position.positionAmount);
        if (detail.mul(positionAmount) == marginAmount) {
            return true;
        }
        return false;
    }

    /**
     * @dev Settle the funding payment for a position
     */
    function _settlePosition(Types.Position memory position) internal {
        Types.Index memory currentIndex = _global_index[position.positionToken];

        if (position.positionAmount == 0) {
            position.cacheIndex = currentIndex;
            _position[position.id] = position;
            return;
        }

        Types.Index memory oldIndex = position.cacheIndex;

        if (oldIndex.timestamp == currentIndex.timestamp) {
            return;
        }

        if (currentIndex.price == oldIndex.price) {
            return;
        }

        uint256 detail;
        if (currentIndex.price > oldIndex.price) {
            detail = currentIndex.price.sub(oldIndex.price);
        } else {
            detail = oldIndex.price.sub(currentIndex.price);
        }

        uint256 positionAmount = int256Abs(position.positionAmount);
        uint256 funding = positionAmount.mul(detail);

        bool isAdd = false;
        if (currentIndex.price > oldIndex.price && position.positionAmount < 0) {
            isAdd = true;
        }
        if (currentIndex.price < oldIndex.price && position.positionAmount > 0) {
            isAdd = true;
        }

        if (isAdd) {
            position.marginAmount = position.marginAmount + int256(funding);
        } else {
            position.marginAmount = position.marginAmount - int256(funding);
        }
        position.cacheIndex = currentIndex;
        _position[position.id] = position;
    }

    function int256Abs(int256 v) internal pure returns (uint256) {
        uint256 absV = 0;
        if (v > 0) {
            absV = uint256(v);
        } else {
            absV = uint256(-v);
        }
        return absV;
    }
}
