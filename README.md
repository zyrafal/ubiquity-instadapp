# Ubiquity - InstaDapp

## Ubiquity integration with InstaDapp

3 components :

Backend (solidity / smartcontracts)

1. resolver : get Ubiquity datas, i.e. read from Ubiquity protocol
2. connector : interact with Ubiquity prootocol, i.e. write into Ubiquity protocol

Frontend (html / typescript / UI)

3. assembly : display Ubiquity datas issued from resolver, input Ubiquity datas to feed connector

To run the full demo, in one terminal :

```
$ cd backend
$ npm install
$ npm dev
```

and in another terminal

```
$ cd frontend
$ yarn install
$ yarn dev
```

Use your browser with metamask, select (or create) localhost network with this rpc `http://localhost:8545` and chainId 1

And connect to url displayed after "yarn dev", should be http://localhost:3000
