# Ubiquity - InstaDapp contracts - HOWTO deploy



## Ubiquity Connector : 

// cd to this directory, something like : 
`# cd ubiquity-instadapp/backend`

// deploy to mainnet
`#  npx hardhat deploy --tags ConnectV2Ubiquity --network mainnet`

// add verified contract source on etherscan 
`#  npx hardhat etherscan-verify --network mainnet`

Tests can ben done previously with any testnets like rinkeby or ropsten, just change --network param

Deployment example on rinkeby of "Ubiquity-v1" version : 
https://rinkeby.etherscan.io/address/0x199Eb5dD93981970cEceFc2d53C48ED67203d81E#code


## Ubiquity Resolver : 

NOT REVIEWED YET 
