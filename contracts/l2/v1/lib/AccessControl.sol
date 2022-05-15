// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";

contract AccessControl is Context {
    address internal _owner;
    address internal _manager;

    event ManagerChanged(
        address indexed previousManager,
        address indexed newManager
    );

    constructor() {
        _owner = _msgSender();
        _manager = _msgSender();
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function manager() public view virtual returns (address) {
        return _manager;
    }

    modifier onlyOwner() {
        require(
            owner() == _msgSender(),
            "AccessControl: caller is not the owner"
        );
        _;
    }

    modifier onlyManager() {
        require(
            manager() == _msgSender(),
            "AccessControl: caller is not the manager"
        );
        _;
    }

    function disableManager() public virtual onlyOwner {
        _chanageManager(address(0));
    }

    function chanageManager(address newManager) public virtual onlyOwner {
        require(
            newManager != address(0),
            "Ownable: new manager is the zero address"
        );
        _chanageManager(newManager);
    }

    function _chanageManager(address newManager) internal virtual {
        address oldManager = _manager;
        _manager = newManager;

        emit ManagerChanged(oldManager, newManager);
    }
}
