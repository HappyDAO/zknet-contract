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
# Clone project
git clone https://github.com/HappyDAO/zknet-contract.git

# Init
cd zknet-contract
yarn

# Select zksync env, default env is local
# Use local zksync network, config-file: .env.local
export ZKNET_ENV=local

# Use test zksync network, config-file: .env.test
export ZKNET_ENV=test
```

#### Compile contract

```bash
# Compile l2 contract
# Docker must be started, the contract will be compiled in the zksolc image
# The compiled contract is generated in ./artifacts-zk/contracts
yarn compile:l2

# Compile l1 contract
# The compiled contract is generated in ./artifacts/contracts
yarn compile:l1
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

# Test the specified use case
yarn test --grep Perpetual
```

#### Other command tools

```bash
# Export contract abi to ./abi
yarn export-abi

# Export contract docs to ./docs
yarn export-doc

# Format all code(.sol and .ts)
yarn prettier

# Lint all code(.sol and .ts)
yarn lint

# Lint contract code
yarn lint:sol

# Lint ts code
yarn lint:ts

# Clean generated files(cache,cache-zk,artifacts,artifacts-zk,typechain)
yarn clean

# Prepare commit, include export-abi, export-doc, prettier, lint
yarn precommit
```
