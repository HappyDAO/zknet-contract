# Base









## Methods

### chanageManager

```solidity
function chanageManager(address newManager) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newManager | address | undefined |

### disableManager

```solidity
function disableManager() external nonpayable
```






### domainSeparator

```solidity
function domainSeparator() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### manager

```solidity
function manager() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |



## Events

### ManagerChanged

```solidity
event ManagerChanged(address indexed previousManager, address indexed newManager)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousManager `indexed` | address | undefined |
| newManager `indexed` | address | undefined |



