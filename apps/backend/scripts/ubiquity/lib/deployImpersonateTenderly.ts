import { BigNumber, Signer } from "ethers";
import { sendTx, sendTxEth } from "./sendTx";
import addresses from "./constant/addresses";
import abis from "../constant/abis";

import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";

async function deployImpersonateTenderly(
  deployer: SignerWithAddress,
  connectV2UbiquityAddress: string,
  hre: HardhatRuntimeEnvironment
) {
  const { ethers, getNamedAccounts } = hre;
  const { ethWhale: ethWhaleAddress, uadWhale: uadWhaleAddress } = await getNamedAccounts();

  const one = BigNumber.from(10).pow(18);
  const ubiquityTest = "Ubiquity-v1";
  const ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (boolean)"
  ];
  const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
  const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";
  const uADContract = new ethers.Contract(UAD, ABI, ethers.provider);
  const uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI, ethers.provider);

  let instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, ethers.provider);
  const masterAddress = await instaIndex.master();
  const instaConnectorsV2 = new ethers.Contract(addresses.core.connectorsV2, abis.core.connectorsV2, ethers.provider);

  const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;

  await sendTxEth(url, ethWhaleAddress, deployer.address, one.mul(1000));
  await sendTxEth(url, deployer.address, masterAddress, one.mul(100));

  const tx1 = await uADContract.populateTransaction.transfer(deployer.address, one.mul(1000));
  tx1.from = uadWhaleAddress;
  await sendTx(url, tx1);

  const tx2 = await uAD3CRVfContract.populateTransaction.transfer(deployer.address, one.mul(5000));
  tx2.from = uadWhaleAddress;
  await sendTx(url, tx2);

  const tx3 = await instaConnectorsV2.populateTransaction.addConnectors([ubiquityTest], [connectV2UbiquityAddress]);
  tx3.from = masterAddress;
}

export default deployImpersonateTenderly;
