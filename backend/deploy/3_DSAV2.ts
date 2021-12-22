import type { DeployFunction } from "hardhat-deploy/types";
import { abis } from "../scripts/instadapp/constant/abis";

const deployDsaV2: DeployFunction = async function ({ deployments, ethers, getNamedAccounts }) {
  const instaIndexAddress = "0x2971AdFa57b20E5a416aE5a708A8655A9c74f723";
  const { deployer, daiWhale } = await ethers.getNamedSigners();
  const { tester } = await getNamedAccounts();

  const instaIndex = await ethers.getContractAt(abis.core.instaIndex, instaIndexAddress);
  const tx = await instaIndex.build(tester, 2, tester);
  const receipt = await tx.wait();
  const event = receipt.events.find(
    (a: { event: string }) => a.event === "LogAccountCreated"
  );
  const dsaV2Address = event.args.account;
  console.log("dsaV2", dsaV2Address, "for", tester);

  const tx2 = await (await deployer.sendTransaction({
    to: dsaV2Address, value: ethers.BigNumber.from(10).pow(18).mul(12)
  })).wait();

  const erc20ABI = ["function transfer(address to, uint amount) returns (boolean)"];
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const DAIContract = new ethers.Contract(DAI, erc20ABI, daiWhale);
  await DAIContract.transfer(dsaV2Address, ethers.BigNumber.from(10).pow(18).mul(4200))

}
deployDsaV2.tags = ["dsaV2"];
deployDsaV2.skip = async ({ network }) => {
  return network.name != "hardhat";
};


export default deployDsaV2;
