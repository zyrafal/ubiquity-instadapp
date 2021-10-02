import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers, deployments } = hre;
import { BigNumber } from "ethers";
import { InstaUbiquityResolver } from "../artifacts/types";

const one = BigNumber.from(10).pow(18);

describe("Ubiquity resolver", function () {
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  const live = hre.network.live;
  console.log("network", network, chainId, live);

  let deployer: SignerWithAddress;
  let resolver: InstaUbiquityResolver;

  before(async () => {
    deployer = await ethers.getNamedSigner("deployer");
    const nonce = (await deployer.getTransactionCount("latest")) - 1;
    console.log(`deployer @ ${deployer.address} ${nonce}`);

    let resolverAddress;
    if (network == "local2") {
      resolverAddress = ethers.utils.getContractAddress({ from: deployer.address, nonce });
    } //
    else if (network == "tenderly" || network == "local") {
      resolver = await ethers.getContract("InstaUbiquityResolver");
      resolverAddress = resolver.address;
    }

    if (resolverAddress) {
      resolver = await ethers.getContractAt("InstaUbiquityResolver", resolverAddress);
      console.log("InstaUbiquityResolver already deployed");
    } else {
      await deployments.fixture(["InstaUbiquityResolver"]);
      resolver = await ethers.getContract("InstaUbiquityResolver");
      console.log("InstaUbiquityResolver deployed with fixture");
    }

    // test resolver is deployed or crash
    await resolver.ayt();
    console.log(`InstaUbiquityResolver @ ${resolver.address}`);
  });

  describe("Ubiquity Datas", () => {
    // it.only("Should be OK", async () => {});

    it("Should get Ubiquity datas", async () => {
      const datas = await resolver.getUbiquityDatas();
      console.log("datas", datas);
      expect(datas.twapPrice).to.be.gte(one.mul(9).div(10)).lt(one.mul(11).div(10));
      expect(datas.uadTotalSupply).to.be.gte(0);
      expect(datas.uarTotalSupply).to.be.gte(0);
      expect(datas.udebtTotalSupply).to.be.gte(0);
      expect(datas.ubqTotalSupply).to.be.gte(0);
      expect(datas.uadcrv3TotalSupply).to.be.gte(0);
      // expect(datas.totalShares).to.be.gte(0);
    });
  });

  describe("Ubiquity Inventory", () => {
    it("Should get user Ubiquity inventory", async () => {
      const inventory = await resolver.getUbiquityInventory(deployer.address);
      console.log("inventory", inventory);
      expect(inventory.uadBalance).to.be.gte(0);
      expect(inventory.uarBalance).to.be.gte(0);
      expect(inventory.udebtBalance).to.be.gte(0);
      expect(inventory.ubqBalance).to.be.gte(0);
      expect(inventory.crv3Balance).to.be.gte(0);
      expect(inventory.uad3crvBalance).to.be.gte(0);
      expect(inventory.ubqRewards).to.be.gte(0);
      expect(inventory.bondingSharesBalance).to.be.gte(0);
    });
  });

  describe("Ubiquity Adresses", () => {
    it("Should get Ubiquity datas", async () => {
      const addresses = await resolver.getUbiquityAddresses();
      console.log("datas", addresses);
      expect(addresses.ubiquityManagerAddress).to.be.properAddress;
      expect(addresses.masterChefAddress).to.be.properAddress;
      expect(addresses.twapOracleAddress).to.be.properAddress;
      expect(addresses.uadAddress).to.be.properAddress;
      expect(addresses.uarAddress).to.be.properAddress;
      expect(addresses.udebtAddress).to.be.properAddress;
      expect(addresses.ubqAddress).to.be.properAddress;
      expect(addresses.cr3Address).to.be.properAddress;
      expect(addresses.uadcrv3Address).to.be.properAddress;
      expect(addresses.bondingShareAddress).to.be.properAddress;
      expect(addresses.dsaResolverAddress).to.be.properAddress;
      expect(addresses.dsaConnectorAddress).to.be.properAddress;
    });
  });
});
