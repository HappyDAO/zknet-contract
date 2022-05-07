# zknet contracts
zknet contracts of l1 and l2

### Dependency
- hardhat 2.9.3
- typescript 4.6.4
- solidity 0.8.4

### Env
- node 16.14.2
- npm 8.5.0


### Usage
#### Prepare 
```bash
# clone project
git clone https://github.com/HappyDAO/zknet-contract.git

# init
cd zknet-contract
npm install
```

#### Compile contract
```bash
# The compiled contract is generated in ./artifacts/contracts.
npm run compile
```

#### Test contract
```bash
# Test cases are in ./test
npm test
```