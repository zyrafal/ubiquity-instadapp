import { expect } from "chai";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Signer, BigNumber } from "ethers";
import hre from "hardhat";
import { sendTx, sendTxEth } from "./utils/sendTx";

const { ethers, network, getNamedAccounts } = hre;
const { provider, getSigners, utils } = ethers;

describe("Tenderly fork", function () {
  let networkName: string;
  let chainId: number | undefined;
  let deployerSigner: Signer;
  let deployer: string;
  let tester: string;
  let ethWhale: string;
  const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;

  const balance = async (address: string): Promise<string> => {
    return utils.formatEther(await provider.getBalance(address));
  };

  before(async () => {
    const live = network.live;
    networkName = network.name;
    chainId = network.config.chainId;
    console.log("network", networkName, chainId, live);

    ({ deployer, tester, ethWhale } = await getNamedAccounts());
    // deployerSigner = provider.getSigner(deployer);
    [deployerSigner] = await getSigners();
  });

  afterEach(async () => {
    console.log(`ethWhale ${await balance(ethWhale)}`);
    console.log(`deployer ${await balance(deployer)}`);
    console.log(`tester   ${await balance(tester)}`);
  });

  it("Should be OK", async function () {});

  it("Should send ETH from deployer with ethersjs", async function () {
    const balance0 = await provider.getBalance(tester);
    const value = ethers.BigNumber.from(10).pow(14);

    await deployerSigner.sendTransaction({
      from: deployer,
      to: tester,
      value
    });

    const balance1 = await provider.getBalance(tester);
    expect(balance1).to.be.equal(balance0.add(value));
  });

  it("Should send ETH from deployer with sendTx", async function () {
    const balance0 = await provider.getBalance(tester);
    const value = ethers.BigNumber.from(10).pow(14);

    await sendTx(url, {
      from: deployer,
      to: tester,
      value: utils.hexStripZeros(utils.hexlify(value))
    });

    const balance1 = await provider.getBalance(tester);
    expect(balance1).to.be.equal(balance0.add(value));
  });

  it("Should send ETH from deployer with sendTxEth", async function () {
    const balance0 = await provider.getBalance(tester);
    const value = ethers.BigNumber.from(10).pow(14);

    await sendTxEth(url, deployer, tester, value);

    const balance1 = await provider.getBalance(tester);
    expect(balance1).to.be.equal(balance0.add(value));
  });

  it("Should send ETH from ethWhale !", async function () {
    const balance0 = await provider.getBalance(tester);
    const value = ethers.BigNumber.from(10).pow(20);

    const tx = {
      from: ethWhale,
      to: tester,
      value: utils.hexStripZeros(utils.hexlify(value))
    };
    console.log("tx", tx);
    await sendTx(url, tx);

    const balance1 = await provider.getBalance(tester);
    expect(balance1).to.be.equal(balance0.add(value));
  });

  it("Should send ETH from ethWhale ! after populate by ethersjs", async function () {
    const balance0 = await provider.getBalance(tester);
    const value = ethers.BigNumber.from(10).pow(20);

    const tx = await deployerSigner.populateTransaction({
      from: deployer,
      to: tester,
      gasLimit: ethers.BigNumber.from(10).pow(9),
      value
    });
    console.log("tx", tx);
    // await deployerSigner.sendTransaction(tx);
    const tx1 = {
      from: ethWhale,
      to: tx.to,
      value: utils.hexStripZeros(utils.hexlify(tx.value || 0)),
      maxFeePerGas: utils.hexStripZeros(utils.hexlify(tx.maxFeePerGas || 0)),
      maxPriorityFeePerGas: utils.hexStripZeros(utils.hexlify(tx.value || 0)),
      gasLimit: utils.hexStripZeros(utils.hexlify(tx.gasLimit || 0)),
      type: utils.hexStripZeros(utils.hexlify(tx.type || 0)),
      nonce: utils.hexStripZeros(utils.hexlify(tx.nonce || 0)),
      chainId: utils.hexStripZeros(utils.hexlify(tx.chainId || 0))
    };
    console.log("tx1", tx1);
    await sendTx(url, tx1);

    const balance1 = await provider.getBalance(tester);
    expect(balance1).to.be.equal(balance0.add(value));
  });
});
