const abis = require("./constant/abis");
const addresses = require("./constant/addresses");

const hre = require("hardhat");
const { waffle } = hre;
const { deployContract } = waffle;

module.exports = async function ({ connectorName, contractArtifact, signer, connectors }) {
  const connectorInstance = await deployContract(signer, contractArtifact, []);

  await connectors.connect(signer).addConnectors([connectorName], [connectorInstance.address]);

  addresses.connectors[connectorName] = connectorInstance.address;
  abis.connectors[connectorName] = contractArtifact.abi;

  return connectorInstance;
};
