import type { DeployFunction } from "hardhat-deploy/types";

const deployInstaUbiquityResolverFunction: DeployFunction = async function ({ deployments, ethers, network }) {
  const deployer = await ethers.getNamedSigner("deployer");

  const tx = await deployments.deploy("InstaUbiquityResolver", {
    args: [],
    from: deployer.address,
    log: true
  });
};
deployInstaUbiquityResolverFunction.tags = ["InstaUbiquityResolver"];

export default deployInstaUbiquityResolverFunction;
