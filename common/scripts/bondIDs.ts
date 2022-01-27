import { ethers, BigNumber, utils } from "ethers";

import { IUbiquityBondingShareV2, BondStruct } from "../../backend/artifacts/types/IUbiquityBondingShareV2";
import BondingShareV2 from "../../backend/deployments/mainnet/BondingShareV2.json";

import dotenv from "dotenv";
import findupSync from "findup-sync";
dotenv.config({ path: findupSync(".env") || "" });

let bondingShareV2: IUbiquityBondingShareV2;
const addr1 = "0xcE156D5d62a8F82326dA8d808D0f3F76360036D0";
const addr2 = "0x89eae71B865A2A39cBa62060aB1b40bbFFaE5b0D";

// const rpcURL = `http://127.0.0.1:8545`;
const rpcURL = `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`;
const provider = new ethers.providers.JsonRpcProvider(rpcURL);

const bond = async (bondID: BigNumber): Promise<BondStruct> => {
  const _bond: BondStruct = await bondingShareV2.callStatic.getBond(bondID);
  console.log("bond", _bond);
  console.log("bond lpFirstDeposited", utils.formatEther(_bond.lpFirstDeposited));
  console.log("bond lpAmount", utils.formatEther(_bond.lpAmount));
  return _bond;
};

const bondIDs = async (addr: string): Promise<BigNumber[]> => {
  const _bondIDs: BigNumber[] = await bondingShareV2.holderTokens(addr);
  console.log("bondIDs", String(_bondIDs));
  return _bondIDs;
};

const main = async () => {
  bondingShareV2 = new ethers.Contract(BondingShareV2.address, BondingShareV2.abi, provider) as IUbiquityBondingShareV2;

  const _bondIDs1: BigNumber[] = await bondIDs(addr1);
  await bond(_bondIDs1[0]);

  const _bondIDs2: BigNumber[] = await bondIDs(addr2);
  await bond(_bondIDs2[0]);
};

main().catch(console.error);
