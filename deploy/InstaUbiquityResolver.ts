import type { DeployFunction } from "hardhat-deploy/types";

const deployInstaUbiquityResolverFunction: DeployFunction = async function ({ deployments, ethers }) {
  const deployer = (await ethers.getSigners())[0];

  await deployments.deploy("InstaUbiquityResolver", {
    args: [],
    from: deployer.address,
    log: true,
  });
};
deployInstaUbiquityResolverFunction.tags = ["InstaUbiquityResolver"];
deployInstaUbiquityResolverFunction.skip = async ({ getChainId }) => {
  return Number(await getChainId()) != 31337;
};

export default deployInstaUbiquityResolverFunction;
