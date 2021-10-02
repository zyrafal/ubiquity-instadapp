const hre = require("hardhat");
const { ethers } = hre;
const addresses = require("./constant/addresses");
const abis = require("./constant/abis");

const instaImplementationsM1 = require("./constant/abi/core/InstaImplementationM1.json");

module.exports = async function (owner) {
  const instaIndex = await ethers.getContractAt(abis.core.instaIndex, addresses.core.instaIndex);

  const tx = await instaIndex.build(owner, 2, owner);
  const receipt = await tx.wait();
  const event = receipt.events.find((a) => a.event === "LogAccountCreated");
  return await ethers.getContractAt(instaImplementationsM1.abi, event.args.account);
};
