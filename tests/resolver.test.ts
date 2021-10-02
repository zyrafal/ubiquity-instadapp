import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { BigNumber } from "ethers";
import { InstaUbiquityResolver, InstaUbiquityResolver__factory } from "../artifacts/types";

const one = BigNumber.from(10).pow(18);

describe("Ubiquity Resolver", () => {
  let signer: SignerWithAddress;
  let resolver: InstaUbiquityResolver;

  before(async () => {
    [signer] = await ethers.getSigners();

    const chainId = (await ethers.provider.getNetwork()).chainId;
    if (chainId == 31337) {
      console.log("Local network", chainId);

      // resolver potentially deployed with nonce 0 (with --network local)
      const resolverAddress = ethers.utils.getContractAddress({
        from: signer.address,
        nonce: 0
      });

      try {
        resolver = await ethers.getContractAt("InstaUbiquityResolver", resolverAddress);

        // test resolver is deployed or crash
        await resolver.ayt();
        console.log("InstaUbiquityResolver already deployed");
      } catch (e) {
        await deployments.fixture(["InstaUbiquityResolver"]);

        resolver = await ethers.getContract("InstaUbiquityResolver");
        console.log("InstaUbiquityResolver deployed with fixture");
      }
    } else if (chainId == 1) {
      console.log("Mainnet network", chainId);

      // const resolverAddress = "0xb27fa4a958213b8bf5b3eed7d64bcfb3dcb5a5e4";
      const resolverAddress = "0x6c6c0362ef8a89ec41f40174b3866e2a0741e797";
      resolver = await ethers.getContractAt("InstaUbiquityResolver", resolverAddress);
      console.log("Fixture deployed locally");
    } else {
      console.log("Network", chainId);
    }
  });

  describe("Ubiquity Datas", () => {
    it("Should get Ubiquity datas", async () => {
      // const { masterChefAddress } = await resolver.getUbiquityAddresses();
      // console.log("masterChefAddress", masterChefAddress);

      // const masterChef = await ethers.getContractAt(
      //   [
      //     "function totalShares() external view returns (uint256)",
      //     "function pendingUGOV(uint256) external view returns (uint256)",
      //   ],
      //   masterChefAddress,
      // );
      // const totalShares = await masterChef.totalShares();
      // console.log("totalShares", totalShares);
      // const pendingUGOV = await masterChef.pendingUGOV(signer.address);
      // console.log("pendingUGOV", pendingUGOV);

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
      const inventory = await resolver.getUbiquityInventory(signer.address);
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
