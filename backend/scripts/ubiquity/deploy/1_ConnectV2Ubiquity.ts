import type { DeployFunction } from "hardhat-deploy/types";

const deployConnectV2UbiquityFunction: DeployFunction = async function ({ deployments, ethers }) {
  const [deployer] = await ethers.getSigners();

  console.log("ConnectV2Ubiquity deploying... deployer : ", deployer.address);

  await deployments.deploy("ConnectV2Ubiquity", {
    args: [],
    from: deployer.address,
    log: true
  });
};
deployConnectV2UbiquityFunction.tags = ["ConnectV2Ubiquity"];

export default deployConnectV2UbiquityFunction;
