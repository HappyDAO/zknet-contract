# zknet contracts
zknet contracts of l1 and l2

### Dependency
- hardhat 2.9.3
- typescript 4.6.4
- solidity 0.8.4

### Env
- node 16.14.2
- yarn 1.22.18
- docker 20.10.14
- docker-compose 1.29.2


### Usage
#### Prepare 
```bash
# clone project
git clone https://github.com/HappyDAO/zknet-contract.git

# init
cd zknet-contract
yarn
```

#### Compile contract
```bash
# Docker must be started, the contract will be compiled in the zksolc image
# The compiled contract is generated in ./artifacts-zk/contracts.
yarn compile
```

#### Prepare zksync environment
```bash
# The local zksync environment is started through docker
cd zksync-docker && ./rebuild.sh
```

#### Test contract
```bash
# Test cases are in ./test
yarn test
```