# Vault









## Methods

### balanceOf

```solidity
function balanceOf(address account, uint32 token) external view returns (int256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| token | uint32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | int256 | undefined |

### bind

```solidity
function bind(IVault.SignedAccount l1Account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| l1Account | IVault.SignedAccount | undefined |

### chanageManager

```solidity
function chanageManager(address newManager) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newManager | address | undefined |

### deposit

```solidity
function deposit(uint32 token, uint256 amount) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | uint32 | undefined |
| amount | uint256 | undefined |

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

### positionDeposit

```solidity
function positionDeposit(uint64 positionId, uint32 token, uint256 amount) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| positionId | uint64 | undefined |
| token | uint32 | undefined |
| amount | uint256 | undefined |

### positionWithdraw

```solidity
function positionWithdraw(uint64 positionId, uint32 token, uint256 amount) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| positionId | uint64 | undefined |
| token | uint32 | undefined |
| amount | uint256 | undefined |

### transfer

```solidity
function transfer(address to, uint32 token, uint256 amount, uint256 fee) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| token | uint32 | undefined |
| amount | uint256 | undefined |
| fee | uint256 | undefined |

### withdraw

```solidity
function withdraw(uint32 token, uint256 amount) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | uint32 | undefined |
| amount | uint256 | undefined |



## Events

### LogBind

```solidity
event LogBind(string addrL1, string addrL2)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| addrL1  | string | undefined |
| addrL2  | string | undefined |

### LogDeposit

```solidity
event LogDeposit(uint32 indexed token, address indexed account, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | uint32 | undefined |
| account `indexed` | address | undefined |
| amount  | uint256 | undefined |

### LogPositionDeposit

```solidity
event LogPositionDeposit(uint64 indexed positionId, uint32 indexed token, address indexed account, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| positionId `indexed` | uint64 | undefined |
| token `indexed` | uint32 | undefined |
| account `indexed` | address | undefined |
| amount  | uint256 | undefined |

### LogPositionWithdrawn

```solidity
event LogPositionWithdrawn(uint64 indexed positionId, uint32 indexed token, address indexed account, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| positionId `indexed` | uint64 | undefined |
| token `indexed` | uint32 | undefined |
| account `indexed` | address | undefined |
| amount  | uint256 | undefined |

### LogTransfer

```solidity
event LogTransfer(address from, address to, uint32 token, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from  | address | undefined |
| to  | address | undefined |
| token  | uint32 | undefined |
| amount  | uint256 | undefined |

### LogWithdrawn

```solidity
event LogWithdrawn(uint32 indexed token, address indexed account, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | uint32 | undefined |
| account `indexed` | address | undefined |
| amount  | uint256 | undefined |

### ManagerChanged

```solidity
event ManagerChanged(address indexed previousManager, address indexed newManager)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousManager `indexed` | address | undefined |
| newManager `indexed` | address | undefined |



