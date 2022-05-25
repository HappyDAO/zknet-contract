# Configuration









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

### registerToken

```solidity
function registerToken(address token, uint32 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| tokenId | uint32 | undefined |



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



