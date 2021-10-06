# Ubiquity - InstaDapp

Ubiquity integration with InstaDapp

3 components :

BackEnd (solidity / smartcontracts)
- resolver : get Ubiquity datas, i.e. read from Ubiquity protocol
- connector : interact with Ubiquity prootocol, i.e. write into Ubiquity protocol

Frontend  (html / typescript / UI) 
- assembly : display Ubiquity datas issued from resolver, input Ubiquity datas to feed connector


To run the full demo : 

in one terminal : 
$ cd backend 
$ npm install
$ npx hardhat node

in another terminal
$ cd frontend
$ yarn install
$ yarn dev

use your browser with metamask, select (or create) localhost network with this rpc http://localhost:8545 and chainId 1
and connect to url displayed after "yarn dev", should be  http://localhost:3000/                   │
 