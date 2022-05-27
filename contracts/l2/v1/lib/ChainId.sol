// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

/// @title Function for getting the current chain ID
library ChainId {
    /// @notice Gets the current chain ID
    /// @return chainId The current chain ID
    function get() internal view returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
    }
}
