import { BigNumber } from "ethers";
import { sendTxEth } from "./sendTx";
import hre from "hardhat";

const { ethers, getNamedAccounts } = hre;

const address = "0xbc0146E6457e5B816c648C1790dac9eb055C533A";
const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;
const one = BigNumber.from(10).pow(18);

async function main() {
  const { ethWhale: ethWhaleAddress } = await getNamedAccounts();

  console.log("eth   whale", ethers.utils.formatEther(await ethers.provider.getBalance(ethWhaleAddress)));
  console.log("eth address", ethers.utils.formatEther(await ethers.provider.getBalance(address)));

  await sendTxEth(url, ethWhaleAddress, address, one.mul(1000));

  console.log("eth   whale", ethers.utils.formatEther(await ethers.provider.getBalance(ethWhaleAddress)));
  console.log("eth address", ethers.utils.formatEther(await ethers.provider.getBalance(address)));
}

main();
