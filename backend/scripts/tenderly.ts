import { BigNumber, Signer } from "ethers";
import { sendTx, sendTxEth } from "./sendTx";
import addresses from "./constant/addresses";
import abis from "./constant/abis";
import hre from "hardhat";

import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";

const { ethers, getNamedAccounts } = hre;

// deployer: SignerWithAddress,
// connectV2UbiquityAddress: string,
// hre: HardhatRuntimeEnvironment
let deployerAddress = "0x6eebAe27d69fa80f0E4C0E973A2Fed218A56880c";
let dsaAddress = "0x0ed91009756b1d684f2d953f56cf84373d8ceb25";

async function main() {
  const { ethWhale: ethWhaleAddress, uadWhale: uadWhaleAddress } = await getNamedAccounts();

  const one = BigNumber.from(10).pow(18);
  const ubiquityTest = "Ubiquity-v1";
  const ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (boolean)"
  ];
  const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;
  const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
  const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";
  const uADContract = new ethers.Contract(UAD, ABI, ethers.provider);
  const uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI, ethers.provider);

  await sendTxEth(url, ethWhaleAddress, deployerAddress, one.mul(1000));

  const tx1 = await uADContract.populateTransaction.transfer(deployerAddress, one.mul(1000));
  tx1.from = uadWhaleAddress;
  await sendTx(url, tx1);

  const tx2 = await uAD3CRVfContract.populateTransaction.transfer(deployerAddress, one.mul(5000));
  tx2.from = uadWhaleAddress;
  await sendTx(url, tx2);
}

main();
