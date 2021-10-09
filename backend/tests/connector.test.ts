import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import hre from "hardhat";
const { ethers, waffle } = hre;
const { provider } = ethers;

import encodeSpells from "../scripts/encodeSpells";
import addresses from "../scripts/constant/addresses";
import abis from "../scripts/constant/abis";

import instaImplementationsM1 from "../scripts/constant/abi/core/InstaImplementationM1.json";

describe("Ubiquity connector", function () {
  const ubiquityTest = "Ubiquity-v1";
  const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;

  const BOND = "0x2dA07859613C14F6f05c97eFE37B9B4F212b5eF5";
  const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const CRV3 = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
  const POOL3 = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
  const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";

  const one = BigNumber.from(10).pow(18);
  const onep = BigNumber.from(10).pow(6);
  const ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transfer(address to, uint amount) returns (boolean)",
    "function remove_liquidity_one_coin(uint256 _burn_amount, int128 i, uint256 _min_received) external returns (uint256)",
    "function approve(address, uint256) external",
    "function holderTokens(address) view returns (uint256[])",
    "function getBond(uint256) view returns (tuple(address,uint256,uint256,uint256,uint256,uint256))"
  ];

  const ABI2 = ["function add_liquidity(uint256[2],uint256) returns (uint256)"];
  const ABI3 = ["function add_liquidity(uint256[3],uint256)"];

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

  let deployer: SignerWithAddress;

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

  let deployerAddress: string;
  let ethWhaleAddress: string;
  let uadWhaleAddress: string;
  let ethWhale: SignerWithAddress;
  let uadWhale: SignerWithAddress;

  before(async () => {
    deployer = await ethers.getNamedSigner("deployer");
    ({
      ethWhale: ethWhaleAddress,
      uadWhale: uadWhaleAddress,
      deployer: deployerAddress
    } = await hre.getNamedAccounts());
    network = hre.network.name;
    chainId = hre.network.config.chainId;
    live = hre.network.live;
    console.log("network", network, chainId, live);
    POOL3Contract = new ethers.Contract(POOL3, ABI.concat(ABI3), provider);
    CRV3Contract = new ethers.Contract(CRV3, ABI, provider);
    uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI.concat(ABI2), provider);
    uADContract = new ethers.Contract(UAD, ABI, provider);
    DAIContract = new ethers.Contract(DAI, ABI, provider);
    USDCContract = new ethers.Contract(USDC, ABI, provider);
    USDTContract = new ethers.Contract(USDT, ABI, provider);
    BONDContract = new ethers.Contract(BOND, ABI, provider);
    instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, provider);
    const receipt = await (await instaIndex.connect(deployer).build(deployer.address, 2, deployer.address)).wait();
    const event = receipt.events.find((a: any) => a.event === "LogAccountCreated");
    const dsaAddress: string = event.args.account;
    dsa = (await ethers.getContractAt(instaImplementationsM1, dsaAddress)).connect(deployer);
    // if (network == "hardhat")
    // {
    //   await deployer.sendTransaction({ to: dsaAddress, value: one.mul(100) });
    // } else if (network =="tenderly"{
    //   const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;
    //   await sendTxEth( url , deployer.address, dsaAddress, one.mul(100));
    // }
  });

  afterEach(async () => {
    console.log("deployer       eth", utils.formatEther(await ethers.provider.getBalance(deployer.address)));
    console.log("deployer       uad", utils.formatEther(await uADContract.balanceOf(deployer.address)));
    console.log("deployer uad3CRV-f", utils.formatEther(await uAD3CRVfContract.balanceOf(deployer.address)));
    console.log("dsa            eth", utils.formatEther(await ethers.provider.getBalance(dsa.address)));
    console.log("dsa            dai", utils.formatEther(await DAIContract.balanceOf(dsa.address)));
    console.log("dsa           usdc", utils.formatUnits(await USDCContract.balanceOf(dsa.address), 6));
    console.log("dsa           usdt", utils.formatUnits(await USDTContract.balanceOf(dsa.address), 6));
    console.log("dsa            uad", utils.formatEther(await uADContract.balanceOf(dsa.address)));
    console.log("dsa           3CRV", utils.formatEther(await CRV3Contract.balanceOf(dsa.address)));
    console.log("dsa      uad3CRV-f", utils.formatEther(await uAD3CRVfContract.balanceOf(dsa.address)));
    console.log("dsa          bonds", utils.formatEther(await bondingShareLpAmount(dsa.address)));
  });

  const dsaDepositUAD3CRVf = async (amount: number) => {
    await uADContract.connect(deployer).approve(uAD3CRVfContract.address, one.mul(amount).mul(2));
    await uAD3CRVfContract.connect(deployer).add_liquidity([one.mul(amount).mul(2), 0], 0);
    await uAD3CRVfContract.connect(deployer).transfer(dsa.address, one.mul(amount));
  };

  const dsaDepositUAD = async (amount: number) => {
    await uAD3CRVfContract
      .connect(deployer)
      .remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 0, one.mul(amount));
    await uADContract.connect(deployer).transfer(dsa.address, one.mul(amount));
  };

  const dsaDepositCRV3 = async (amount: number) => {
    await uAD3CRVfContract
      .connect(deployer)
      .remove_liquidity_one_coin(one.mul(amount).mul(110).div(100), 1, one.mul(amount));
    await CRV3Contract.connect(deployer).transfer(dsa.address, one.mul(amount));
  };

  const dsaDepositDAI = async (amount: number) => {
    await uAD3CRVfContract
      .connect(deployer)
      .remove_liquidity_one_coin(one.mul(amount).mul(120).div(100), 1, one.mul(amount).mul(110).div(100));
    await POOL3Contract.connect(deployer).remove_liquidity_one_coin(
      one.mul(amount).mul(110).div(100),
      0,
      one.mul(amount)
    );
    await DAIContract.connect(deployer).transfer(dsa.address, one.mul(amount));
  };
  const dsaDepositUSDC = async (amount: number) => {
    await uAD3CRVfContract
      .connect(deployer)
      .remove_liquidity_one_coin(one.mul(amount).mul(120).div(100), 1, one.mul(amount).mul(110).div(100));
    await POOL3Contract.connect(deployer).remove_liquidity_one_coin(
      one.mul(amount).mul(110).div(100),
      1,
      onep.mul(amount)
    );
    await USDCContract.connect(deployer).transfer(dsa.address, onep.mul(amount));
  };
  const dsaDepositUSDT = async (amount: number) => {
    await uAD3CRVfContract
      .connect(deployer)
      .remove_liquidity_one_coin(one.mul(amount).mul(120).div(100), 1, one.mul(amount).mul(110).div(100));
    await POOL3Contract.connect(deployer).remove_liquidity_one_coin(
      one.mul(amount).mul(110).div(100),
      2,
      onep.mul(amount)
    );
    await USDTContract.connect(deployer).transfer(dsa.address, onep.mul(amount));
  };

  describe("DSA wallet setup", function () {
    it("Should be OK", async function () {});

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
      console.log("dsa      uad3CRV-f", utils.formatEther(await uAD3CRVfContract.balanceOf(dsa.address)));

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
});
