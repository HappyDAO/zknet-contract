// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

interface IConfiguration {
    function registerToken(address token, uint32 tokenId) external;
}
