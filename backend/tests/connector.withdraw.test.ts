import type { SignerWithAddress } from "hardhat-deploy-ethers/dist/src/signers";
import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import hre from "hardhat";
const { ethers, waffle } = hre;
const { provider } = ethers;

import encodeSpells from "../scripts/encodeSpells";
import addresses from "../scripts/constant/addresses";
import abis from "../scripts/constant/abis";
import hardhatConfig from "../hardhat.config";

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

  const blockFork = 13097100;
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

  async function forkReset(blockNumber: number) {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: hardhatConfig?.networks?.hardhat?.forking?.url,
            blockNumber
          }
        }
      ]
    });
  }

  const bondingShareLpAmount = async function (address: string) {
    let LP = 0;
    const bondIds = await BONDContract.holderTokens(address);
    if (bondIds.length) {
      console.log("dsa         bondId", bondIds[0].toString());

      const bond = await BONDContract.getBond(bondIds[0]);
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

  beforeEach(async () => {
    // await forkReset(blockFork);

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
    console.log("dsa        n bonds", (await BONDContract.holderTokens(dsa.address)).length);
    console.log("dsa       lp bonds", utils.formatEther(await bondingShareLpAmount(dsa.address)));
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
          deployer.address
        )
      ).to.be.not.reverted;

      expect(await bondingShareLpAmount(dsa.address)).to.be.gt(0);
    });

    it("Should withdraw Ubiquity Bonding Shares to get back uAD", async function () {
      await expect(
        dsa.cast(
          ...encodeSpells([
            {
              connector: ubiquityTest,
              method: "withdraw",
              args: [34, UAD, 0, 0]
            }
          ]),
          deployer.address
        )
      ).to.be.not.reverted;
      expect(await bondingShareLpAmount(dsa.address)).to.be.equal(0);
    });
  });
});
