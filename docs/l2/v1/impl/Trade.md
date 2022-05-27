# Trade









## Methods

### chanageManager

```solidity
function chanageManager(address newManager) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newManager | address | undefined |

### deleverage

```solidity
function deleverage(ITrade.DeleverageOrder deleveragedOrder, ITrade.DeleverageOrder deleveragerOrder) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| deleveragedOrder | ITrade.DeleverageOrder | undefined |
| deleveragerOrder | ITrade.DeleverageOrder | undefined |

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

### fundingTick

```solidity
function fundingTick(ITrade.Indice[] indices) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| indices | ITrade.Indice[] | undefined |

### liquidate

```solidity
function liquidate(uint64 liquidatedPositionId, ITrade.Order liquidatorOrder, ITrade.SettlementInfo settlementInfo) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidatedPositionId | uint64 | undefined |
| liquidatorOrder | ITrade.Order | undefined |
| settlementInfo | ITrade.SettlementInfo | undefined |

### manager

```solidity
function manager() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### oraclePricesTick

```solidity
function oraclePricesTick(ITrade.OraclePrice[] oraclePrices) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| oraclePrices | ITrade.OraclePrice[] | undefined |

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### settlement

```solidity
function settlement(ITrade.Order partA, ITrade.Order partB, ITrade.SettlementInfo settlementInfo) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| partA | ITrade.Order | undefined |
| partB | ITrade.Order | undefined |
| settlementInfo | ITrade.SettlementInfo | undefined |



## Events

### LogFundingTick

```solidity
event LogFundingTick(uint32 positiontoken, int256 fundingRate)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| positiontoken  | uint32 | undefined |
| fundingRate  | int256 | undefined |

### LogPositionChange

```solidity
event LogPositionChange(uint64 indexed positionId, uint256 marginAmount, uint256 positionAmount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| positionId `indexed` | uint64 | undefined |
| marginAmount  | uint256 | undefined |
| positionAmount  | uint256 | undefined |

### ManagerChanged

```solidity
event ManagerChanged(address indexed previousManager, address indexed newManager)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousManager `indexed` | address | undefined |
| newManager `indexed` | address | undefined |



