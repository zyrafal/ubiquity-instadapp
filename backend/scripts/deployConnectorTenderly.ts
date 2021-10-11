import { BigNumber } from "ethers";
import { sendTx, sendTxEth } from "./sendTx";
import addresses from "./constant/addresses";
import abis from "./constant/abis";
import hre from "hardhat";

const { ethers, getNamedAccounts } = hre;

const ubiquityTest = "Ubiquity-v1";
const connectV2UbiquityAddress = "0x4b7992f03906f7bbe3d48e5fb724f52c56cfb039";
const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;
const one = BigNumber.from(10).pow(18);

async function main() {
  const { ethWhale: ethWhaleAddress } = await getNamedAccounts();

  const instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, ethers.provider);
  const masterAddress = await instaIndex.master();
  const instaConnectorsV2 = new ethers.Contract(addresses.core.connectorsV2, abis.core.connectorsV2, ethers.provider);

  await sendTxEth(url, ethWhaleAddress, masterAddress, one.mul(1000));

  // await instaConnectorsV2.connect(master).addConnectors([ubiquityTest], [connectV2UbiquityAddress]);
  const tx1 = await instaConnectorsV2.populateTransaction.addConnectors([ubiquityTest], [connectV2UbiquityAddress]);
  tx1.from = masterAddress;
  await sendTx(url, tx1);

  // addresses.connectors[ubiquityTest] = connectV2UbiquityAddress;
  // abis.connectors[ubiquityTest] = contractArtifact.abi;
}

main();
