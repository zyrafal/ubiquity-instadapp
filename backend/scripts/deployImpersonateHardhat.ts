import { BigNumber, Signer } from "ethers";
import addresses from "./constant/addresses";
import abis from "./constant/abis";
import instaImplementationsM1 from "../scripts/constant/abi/core/InstaImplementationM1.json";

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
  const { ethWhale: ethWhaleAddress, uadWhale: uadWhaleAddress, tester: testerAddress } = await getNamedAccounts();

  const one = BigNumber.from(10).pow(18);
  const ubiquityTest = "Ubiquity-v1";
  const ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address, uint256)",
    "function remove_liquidity_one_coin(uint256 _burn_amount, int128 i, uint256 _min_received) external returns (uint256)",
    "function transfer(address to, uint amount) returns (boolean)"
  ];
  const ABI2 = ["function add_liquidity(uint256[2],uint256) returns (uint256)"];
  const ABI3 = ["function add_liquidity(uint256[3],uint256)"];

  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
  const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";
  const POOL3 = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
  const POOL3Contract = new ethers.Contract(POOL3, ABI.concat(ABI3), ethers.provider);
  const DAIContract = new ethers.Contract(DAI, ABI, ethers.provider);
  const uADContract = new ethers.Contract(UAD, ABI, ethers.provider);
  const uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI.concat(ABI2), ethers.provider);

  let instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, deployer);
  const masterAddress = await instaIndex.master();
  const instaConnectorsV2 = new ethers.Contract(addresses.core.connectorsV2, abis.core.connectorsV2, ethers.provider);

  // ETH UAD whales
  impersonate(ethWhaleAddress, network.provider);
  impersonate(uadWhaleAddress, network.provider);
  let ethWhale = await ethers.getSigner(ethWhaleAddress);
  let uadWhale = await ethers.getSigner(uadWhaleAddress);

  // whales SEND ETH, UAD, UAD3CRV-f to deployer
  await ethWhale.sendTransaction({ to: deployer.address, value: one.mul(2000) });
  await uADContract.connect(uadWhale).transfer(deployer.address, one.mul(11000));
  await uADContract.connect(deployer).approve(uAD3CRVfContract.address, one.mul(3000));
  await uAD3CRVfContract.connect(deployer).add_liquidity([one.mul(3000), 0], 0);
  await ethWhale.sendTransaction({ to: deployer.address, value: one.mul(5000) });
  await uADContract.connect(uadWhale).transfer(deployer.address, one.mul(25000));
  await uADContract.connect(deployer).approve(uAD3CRVfContract.address, one.mul(8000));
  await uAD3CRVfContract.connect(deployer).add_liquidity([one.mul(8000), 0], 0);

  // InstaDapp master
  impersonate(masterAddress, network.provider);
  let master = await ethers.getSigner(masterAddress);
  await deployer.sendTransaction({ to: masterAddress, value: one.mul(100) });
  await instaConnectorsV2.connect(master).addConnectors([ubiquityTest], [connectV2UbiquityAddress]);

  // console.log("connectV2UbiquityAddress", connectV2UbiquityAddress);
  // const conn = new ethers.Contract(connectV2UbiquityAddress, [
  //   "function deposit(address,uint256,uint256,uint256,uint256) external payable returns (string memory , bytes memory)",
  //   "function withdraw(uint256,address,uint256,uint256) external payable returns (string memory , bytes memory)"
  // ]);
  // await conn.connect(deployer).deposit(UAD, 1000000, 4, 0, 0);
  // await conn.connect(deployer).withdraw(34, UAD, 0, 0);

  // // deployer SEND ETH, UAD, UAD3CRV-f to tester
  // await deployer.sendTransaction({ to: testerAddress, value: one.mul(1000) });
  // await uADContract.connect(deployer).transfer(testerAddress, one.mul(5000));
  // await uAD3CRVfContract.connect(deployer).transfer(testerAddress, one.mul(2000));

  // // Create DSA for tester
  // const receipt = await (await instaIndex.build(testerAddress, 2, testerAddress)).wait();
  // const event = receipt.events.find((a: any) => a.event === "LogAccountCreated");
  // const dsaAddress: string = event.args.account;
  // const dsa = (await ethers.getContractAt(instaImplementationsM1, dsaAddress)).connect(deployer);

  // // deployer SEND ETH, UAD, UAD3CRV-f to dsa tester
  // await deployer.sendTransaction({ to: dsaAddress, value: one.mul(1000) });
  // await uADContract.connect(deployer).transfer(dsaAddress, one.mul(5000));
  // await uAD3CRVfContract.connect(deployer).transfer(dsaAddress, one.mul(2000));

  // // deployer SEND DAI to dsa tester
  // await uAD3CRVfContract
  //   .connect(deployer)
  //   .remove_liquidity_one_coin(one.mul(200).mul(120).div(100), 1, one.mul(200).mul(110).div(100));
  // await POOL3Contract.connect(deployer).remove_liquidity_one_coin(one.mul(200).mul(110).div(100), 0, one.mul(200));
  // await DAIContract.connect(deployer).transfer(dsa.address, one.mul(200));

  console.log("deployer         eth", ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("deployer         uad", ethers.utils.formatEther(await uADContract.balanceOf(deployer.address)));
  console.log("deployer   uad3CRV-f", ethers.utils.formatEther(await uAD3CRVfContract.balanceOf(deployer.address)));
  // console.log("tester           eth", ethers.utils.formatEther(await ethers.provider.getBalance(testerAddress)));
  // console.log("tester           uad", ethers.utils.formatEther(await uADContract.balanceOf(testerAddress)));
  // console.log("tester     uad3CRV-f", ethers.utils.formatEther(await uAD3CRVfContract.balanceOf(testerAddress)));
  // console.log("tester dsa       eth", ethers.utils.formatEther(await ethers.provider.getBalance(dsaAddress)));
  // console.log("tester dsa       uad", ethers.utils.formatEther(await uADContract.balanceOf(dsaAddress)));
  // console.log("tester dsa uad3CRV-f", ethers.utils.formatEther(await uAD3CRVfContract.balanceOf(dsaAddress)));
}

export default deployImpersonateHardhat;
