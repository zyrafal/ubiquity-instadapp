import { BigNumber, Signer } from "ethers";
import addresses from "./constant/addresses";
import abis from "./constant/abis";

import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { EthereumProvider } from "hardhat/types";
import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";

async function impersonate(account: string, provider: EthereumProvider) {
  await provider.request({
    method: "hardhat_impersonateAccount",
    params: [account]
  });
}

async function deployImpersonateHardhat(
  deployer: SignerWithAddress,
  connectV2UbiquityAddress: string,
  hre: HardhatRuntimeEnvironment
) {
  const { ethers, network, getNamedAccounts } = hre;
  const { ethWhale: ethWhaleAddress, uadWhale: uadWhaleAddress } = await getNamedAccounts();

  const one = BigNumber.from(10).pow(18);
  const ubiquityTest = "Ubiquity-v1";
  const ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function add_liquidity(uint256[2],uint256) returns (uint256)",
    "function approve(address, uint256)",
    "function transfer(address to, uint amount) returns (boolean)"
  ];
  const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
  const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";
  const uADContract = new ethers.Contract(UAD, ABI, ethers.provider);
  const uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI, ethers.provider);

  let instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, deployer);
  const masterAddress = await instaIndex.master();
  const instaConnectorsV2 = new ethers.Contract(addresses.core.connectorsV2, abis.core.connectorsV2, ethers.provider);

  impersonate(ethWhaleAddress, network.provider);
  impersonate(uadWhaleAddress, network.provider);
  impersonate(masterAddress, network.provider);

  let ethWhale = await ethers.getSigner(ethWhaleAddress);
  let uadWhale = await ethers.getSigner(uadWhaleAddress);
  await ethWhale.sendTransaction({ to: deployer.address, value: one.mul(1000) });
  await uADContract.connect(uadWhale).transfer(deployer.address, one.mul(10000));
  await uADContract.connect(deployer).approve(uAD3CRVfContract.address, one.mul(2000));
  await uAD3CRVfContract.connect(deployer).add_liquidity([one.mul(2000), 0], 0);

  let master = await ethers.getSigner(masterAddress);
  await deployer.sendTransaction({ to: masterAddress, value: one.mul(100) });
  await instaConnectorsV2.connect(master).addConnectors([ubiquityTest], [connectV2UbiquityAddress]);

  console.log("deployer       eth", ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("deployer       uad", ethers.utils.formatEther(await uADContract.balanceOf(deployer.address)));
  console.log("deployer uad3CRV-f", ethers.utils.formatEther(await uAD3CRVfContract.balanceOf(deployer.address)));
}

export default deployImpersonateHardhat;
