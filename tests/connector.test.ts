import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { expect } from "chai";
import hre from "hardhat";
import { BigNumber, Contract } from "ethers";
const ethers = hre.ethers;

import deployAndEnableConnector from "../scripts/deployAndEnableConnector.js";
import encodeSpells from "../scripts/encodeSpells";
import addresses from "../scripts/constant/addresses";
import abis from "../scripts/constant/abis";
import impersonate from "../scripts/impersonate";
import { forkReset, sendEth } from "./utils";
import { ConnectV2Ubiquity } from "../artifacts/types";

import connectV2UbiquityArtifacts from "../artifacts/contracts/connector/main.sol/ConnectV2Ubiquity.json";

import instaImplementationsM1 from "../scripts/constant/abi/core/InstaImplementationM1.json";

describe("Ubiquity connector", function () {
  const ubiquityTest = "Ubiquity-v1";

  const BOND = "0x2dA07859613C14F6f05c97eFE37B9B4F212b5eF5";
  const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const CRV3 = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
  const POOL3 = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
  const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";

  const ethWhaleAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const uadWhaleAddress = "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd";

  const blockFork = 13165306;
  const one = BigNumber.from(10).pow(18);
  const onep = BigNumber.from(10).pow(6);
  const ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transfer(address to, uint amount) returns (boolean)",
    "function remove_liquidity_one_coin(uint256 _burn_amount, int128 i, uint256 _min_received) external returns (uint256)",
    "function add_liquidity(uint256[3],uint256) returns (uint256)",
    "function approve(address, uint256) external",
    "function holderTokens(address) view returns (uint256[])",
    "function getBond(uint256) view returns (tuple(address,uint256,uint256,uint256,uint256,uint256))"
  ];
  let dsa: Contract;
  let POOL3Contract: Contract;
  let CRV3Contract: Contract;
  let uAD3CRVfContract: Contract;
  let uADContract: Contract;
  let DAIContract: Contract;
  let USDCContract: Contract;
  let USDTContract: Contract;
  let BONDContract: Contract;
  let instaIndex: Contract;
  let instaConnectorsV2: Contract;
  let connector: ConnectV2Ubiquity;

  let uadWhale;
  let ethWhale;

  const bondingShareLpAmount = async function (address: string) {
    let LP = 0;
    const bondId = await BONDContract.holderTokens(address);
    if (bondId.length) {
      const bond = await BONDContract.getBond(bondId[0]);
      LP = bond[5];
    }
    // console.log("LP", ethers.utils.formatEther(LP.toString()));
    return LP;
  };
  let network: string;
  let chainId: number | undefined;
  let live: boolean;

  before(async () => {
    network = hre.network.name;
    chainId = hre.network.config.chainId;
    live = hre.network.live;
    console.log("network", network, chainId, live);
  });

  beforeEach(async () => {
    let { deployer, ethWhale, uadWhale } = await ethers.getNamedSigners();

    if (network == "hardhat") {
      await forkReset(blockFork);

      [uadWhale] = await impersonate([uadWhaleAddress]);
      [ethWhale] = await impersonate([ethWhaleAddress]);

      await sendEth(ethWhale, uadWhaleAddress, 100);
    }
    if (network == "tenderly") {
      await sendEth(deployer, uadWhaleAddress, 100);
    }

    POOL3Contract = new ethers.Contract(POOL3, ABI, uadWhale);
    CRV3Contract = new ethers.Contract(CRV3, ABI, uadWhale);
    uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI, uadWhale);
    uADContract = new ethers.Contract(UAD, ABI, uadWhale);
    DAIContract = new ethers.Contract(DAI, ABI, uadWhale);
    USDCContract = new ethers.Contract(USDC, ABI, uadWhale);
    USDTContract = new ethers.Contract(USDT, ABI, uadWhale);
    BONDContract = new ethers.Contract(BOND, ABI, uadWhale);

    instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, ethWhale);
    instaConnectorsV2 = new ethers.Contract(addresses.core.connectorsV2, abis.core.connectorsV2);

    const receipt = await (await instaIndex.build(uadWhaleAddress, 2, uadWhaleAddress)).wait();
    const event = receipt.events.find((a: any) => a.event === "LogAccountCreated");
    const dsaAddress: string = event.args.account;
    dsa = (await ethers.getContractAt(instaImplementationsM1, dsaAddress)).connect(uadWhale);
    await sendEth(ethWhale, dsa.address, 100);

    const masterAddress = await instaIndex.master();
    const [master] = await impersonate([masterAddress]);
    await sendEth(ethWhale, masterAddress, 100);

    connector = (await deployAndEnableConnector({
      connectorName: ubiquityTest,
      contractArtifact: connectV2UbiquityArtifacts,
      signer: master,
      connectors: instaConnectorsV2
    })) as ConnectV2Ubiquity;
  });

  const dsaDepositUAD3CRVf = async (amount: number) => {
    await uAD3CRVfContract.transfer(dsa.address, one.mul(amount));
  };

  const dsaDepositUAD = async (amount: number) => {
    await uAD3CRVfContract.remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 0, one.mul(amount));
    await uADContract.transfer(dsa.address, one.mul(amount));
  };

  const dsaDepositCRV3 = async (amount: number) => {
    await uAD3CRVfContract.remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 1, one.mul(amount));
    await CRV3Contract.transfer(dsa.address, one.mul(amount));
  };

  const dsaDepositDAI = async (amount: number) => {
    await uAD3CRVfContract.remove_liquidity_one_coin(
      one.mul(amount).mul(120).div(100),
      1,
      one.mul(amount).mul(110).div(100)
    );
    await POOL3Contract.remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 0, one.mul(amount));
    await DAIContract.transfer(dsa.address, one.mul(amount));
  };
  const dsaDepositUSDC = async (amount: number) => {
    await uAD3CRVfContract.remove_liquidity_one_coin(
      one.mul(amount).mul(120).div(100),
      1,
      one.mul(amount).mul(110).div(100)
    );
    await POOL3Contract.remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 1, onep.mul(amount));
    await USDCContract.transfer(dsa.address, onep.mul(amount));
  };
  const dsaDepositUSDT = async (amount: number) => {
    await uAD3CRVfContract.remove_liquidity_one_coin(
      one.mul(amount).mul(120).div(100),
      1,
      one.mul(amount).mul(110).div(100)
    );
    await POOL3Contract.remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 2, onep.mul(amount));
    await USDTContract.transfer(dsa.address, onep.mul(amount));
  };

  describe("DSA wallet setup", function () {
    it("Should have contracts deployed.", async function () {
      expect(POOL3Contract.address).to.be.properAddress;
      expect(CRV3Contract.address).to.be.properAddress;
      expect(uADContract.address).to.be.properAddress;
      expect(uAD3CRVfContract.address).to.be.properAddress;
      expect(DAIContract.address).to.be.properAddress;
      expect(USDCContract.address).to.be.properAddress;
      expect(USDTContract.address).to.be.properAddress;
      expect(BONDContract.address).to.be.properAddress;
      expect(instaIndex.address).to.be.properAddress;
      expect(instaConnectorsV2.address).to.be.properAddress;
      expect(connector.address).to.be.properAddress;
      expect(dsa.address).to.be.properAddress;
    });
    it("Should deposit uAD3CRVf into DSA wallet", async function () {
      await dsaDepositUAD3CRVf(100);
      expect(await uAD3CRVfContract.balanceOf(dsa.address)).to.be.gte(one.mul(100));
    });
    it("Should deposit uAD into DSA wallet", async function () {
      await dsaDepositUAD(100);
      expect(await uADContract.balanceOf(dsa.address)).to.be.gte(one.mul(100));
    });
    it("Should deposit 3CRV into DSA wallet", async function () {
      await dsaDepositCRV3(100);
      expect(await CRV3Contract.balanceOf(dsa.address)).to.be.gte(one.mul(100));
    });
    it("Should deposit DAI into DSA wallet", async function () {
      await dsaDepositDAI(100);
      expect(await DAIContract.balanceOf(dsa.address)).to.be.gte(one.mul(100));
    });
    it("Should deposit USDC into DSA wallet", async function () {
      await dsaDepositUSDC(100);
      expect(await USDCContract.balanceOf(dsa.address)).to.be.gte(onep.mul(100));
    });
    it("Should deposit USDT into DSA wallet", async function () {
      await dsaDepositUSDT(100);
      expect(await USDTContract.balanceOf(dsa.address)).to.be.gte(onep.mul(100));
    });
  });

  describe("Main", function () {
    it("should deposit uAD3CRVf to get Ubiquity Bonding Shares", async function () {
      await dsaDepositUAD3CRVf(100);
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "deposit",
              args: [UAD3CRVF, one, 4, 0, 0]
            }
          ]),
          uadWhaleAddress
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });

    it("should deposit uAD to get Ubiquity Bonding Shares", async function () {
      await dsaDepositUAD(100);
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "deposit",
              args: [UAD, one, 4, 0, 0]
            }
          ]),
          uadWhaleAddress
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });

    it("should deposit 3CRV to get Ubiquity Bonding Shares", async function () {
      await dsaDepositCRV3(100);
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "deposit",
              args: [CRV3, one, 4, 0, 0]
            }
          ]),
          uadWhaleAddress
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });

    it("should deposit DAI to get Ubiquity Bonding Shares", async function () {
      await dsaDepositDAI(100);
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "deposit",
              args: [DAI, one.mul(100), 4, 0, 0]
            }
          ]),
          uadWhaleAddress
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });

    it("should deposit USDC to get Ubiquity Bonding Shares", async function () {
      await dsaDepositUSDC(100);
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "deposit",
              args: [USDC, onep.mul(100), 4, 0, 0]
            }
          ]),
          uadWhaleAddress
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });

    it("should deposit USDT to get Ubiquity Bonding Shares", async function () {
      await dsaDepositUSDT(100);
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "deposit",
              args: [USDT, onep.mul(100), 4, 0, 0]
            }
          ]),
          uadWhaleAddress
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });
  });

  describe("3Pool test", function () {
    it("Should add DAI liquidity to 3Pool", async function () {
      const n = 100;
      await dsaDepositDAI(n);
      const amount = one.mul(n);
      const [dsaSigner] = await impersonate([dsa.address]);

      expect(await DAIContract.balanceOf(dsa.address)).to.be.equal(amount);
      expect(await CRV3Contract.balanceOf(dsa.address)).to.be.equal(0);

      await (await DAIContract.connect(dsaSigner).approve(POOL3, amount)).wait();
      await (await POOL3Contract.connect(dsaSigner).add_liquidity([amount, 0, 0], amount.mul(98).div(100))).wait();

      expect(await DAIContract.balanceOf(dsa.address)).to.be.equal(0);
      expect(await CRV3Contract.balanceOf(dsa.address))
        .to.be.gte(amount.mul(98).div(100))
        .to.be.lte(amount.mul(102).div(100));
    });
  });
});
