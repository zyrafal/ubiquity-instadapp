import deployImpersonateHardhat from "../scripts/deployImpersonateHardhat";
import deployImpersonateTenderly from "../scripts/deployImpersonateTenderly";

import type { DeployFunction } from "hardhat-deploy/types";

const deployInstaUbiquityConnectorFunction: DeployFunction = async function (hre) {
  const { deployments, ethers, network } = hre;
  const deployer = await ethers.getNamedSigner("deployer");

  console.log("network", network.name, network.config.chainId);

  const deployResult = await deployments.deploy("ConnectV2Ubiquity", {
    args: [],
    from: deployer.address,
    log: true
  });

  if (deployResult.newlyDeployed) {
    if (network.name == "hardhat") {
      await deployImpersonateHardhat(deployer, deployResult.address, hre);
    } else if (network.name == "tenderly") {
      await deployImpersonateTenderly(deployer, deployResult.address, hre);
    }
    // addresses.connectors[ubiquityTest] = connector.address;
  }
};
deployInstaUbiquityConnectorFunction.tags = ["InstaUbiquityConnector"];

export default deployInstaUbiquityConnectorFunction;
