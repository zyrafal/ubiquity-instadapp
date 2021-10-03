import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers, deployments } = hre;
import { BigNumber, utils } from "ethers";
import { sendEth } from "./utils";

describe("Tenderly fork", function () {
  let chainId: number | undefined;
  let deployer: SignerWithAddress;
  let tester: SignerWithAddress;
  let uadWhale: SignerWithAddress;

  before(async () => {
    const network = hre.network.name;
    const live = hre.network.live;
    chainId = hre.network.config.chainId;
    console.log("network", network, chainId, live);

    ({ deployer, tester, uadWhale } = await ethers.getNamedSigners());

    // deploy resolver ?
    // await deployments.fixture(["InstaUbiquityResolver"]);
  });

  it("Should be OK", async function () {});

  it("Should get balance", async function () {
    console.log(`Balance ${deployer.address} ${utils.formatEther(await deployer.getBalance())}`);
  });

  it("Should send ETH", async function () {
    console.log(`Balance ${deployer.address} ${utils.formatEther(await deployer.getBalance())}`);
    console.log(`Balance ${tester.address} ${utils.formatEther(await tester.getBalance())}`);

    await sendEth(deployer, tester.address, 100);

    console.log(`Balance ${deployer.address} ${utils.formatEther(await deployer.getBalance())}`);
    console.log(`Balance ${tester.address} ${utils.formatEther(await tester.getBalance())}`);
  });
});
