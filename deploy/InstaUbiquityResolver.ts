import type { DeployFunction } from "hardhat-deploy/types";

const deployInstaUbiquityResolverFunction: DeployFunction = async function ({ deployments, ethers }) {
  const [deployer] = await ethers.getSigners();

  console.log("InstaUbiquityResolver deploying... deployer : ", deployer.address);

  await deployments.deploy("InstaUbiquityResolver", {
    args: [],
    from: deployer.address,
    log: true
  });
};
deployInstaUbiquityResolverFunction.tags = ["InstaUbiquityResolver"];

export default deployInstaUbiquityResolverFunction;
