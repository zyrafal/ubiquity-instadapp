import type { DeployFunction } from "hardhat-deploy/types";
import { abis } from "../scripts/instadapp/constant/abis";
import { abi as abiDsaV2 } from "../deployements/mainnet/Implementation_m1.sol/InstaImplementationM1.json";

const deployDsaV2: DeployFunction = async function ({ deployments, ethers, getNamedAccounts }) {
  const instaIndexAddress = "0x2971AdFa57b20E5a416aE5a708A8655A9c74f723";
  const deployer = await ethers.getNamedSigner("deployer");
  const { tester } = await getNamedAccounts();

  const instaIndex = await ethers.getContractAt(abis.core.instaIndex, instaIndexAddress);
  const tx = await instaIndex.build(tester, 2, tester);
  const receipt = await tx.wait();
  const event = receipt.events.find(
    (a: { event: string }) => a.event === "LogAccountCreated"
  );
  const dsaV2Address =  event.args.account;
  console.log("dsaV2",dsaV2Address, "for", tester);

  const tx2 = await (await deployer.sendTransaction({
    to: dsaV2Address, value: ethers.BigNumber.from(10).pow(18).mul(10)
  })).wait();
  console.log(tx2);
};
deployDsaV2.tags = ["dsaV2"];

export default deployDsaV2;
