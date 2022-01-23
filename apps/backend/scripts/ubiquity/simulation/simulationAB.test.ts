import type { BigNumberish, Contract, Signer } from "ethers";
import type { TransactionReceipt } from "@ethersproject/abstract-provider";

import { waffle, ethers } from "hardhat";
import { BigNumber, utils } from "ethers";
import { impersonateAccounts } from "../../instadapp/tests/impersonate";
import { sendEth, mineNBlock, forkReset } from "../lib/utils";

const { provider } = waffle;

const one = BigNumber.from(10).pow(18);
const onep = BigNumber.from(10).pow(6);

const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";
const BOND = "0xC251eCD9f1bD5230823F9A0F99a44A87Ddd4CA38";
const BONDSHARE = "0x2dA07859613C14F6f05c97eFE37B9B4F212b5eF5";

const IUAD3CRF = [
  "function add_liquidity(uint256[2] memory _amounts, uint256 _min_mint_amount) external returns(uint256)",
  "function remove_liquidity_one_coin(uint256 lpAmount,int128 i,  uint256 min_amount) external returns(uint256)"
];
const IBOND = [
  "function deposit(uint256 lpAmount, uint256 durationWeeks) external returns(uint256 bondingShareId)",
  "function removeLiquidity(uint256 lpAmount, uint256 bondId) external",
  "function uADPriceReset(uint256 amount) external"
];
const IBONDSHARE = [
  "function getBond(uint256 bondId) external view returns (tuple(address,uint256,uint256,uint256,uint256,uint256))",
  "function holderTokens(address) external view returns(uint256[])"
];
const IERC1155 = [
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external"
];
const IERC20 = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (boolean)",
  "function approve(address, uint256) external",
  "function totalSupply() external view returns (uint256)"
];

const ethWhaleAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const uadWhaleAddress = "0xefC0e701A824943b469a694aC564Aa1efF7Ab7dd";
let uadWhale: Signer;
let ethWhale: Signer;

let uadContract: Contract;
let lpContract: Contract;
let bondContract: Contract;
let bondShareContract: Contract;


const balanceETH = async (address: string) => utils.formatEther(await ethers.provider.getBalance(address));
const balanceUAD = async (address: string) => utils.formatEther(await uadContract.balanceOf(address));
const balanceLP = async (address: string) => utils.formatEther(await lpContract.balanceOf(address));

const logBalances = async (address: string) => {
  console.log(address);
  console.log("ETH", await balanceETH(address));
  console.log("UAD", await balanceUAD(address));
  console.log("LP ", await balanceLP(address));
};

// INIT simulation 
const simulationInit = async (amount: BigNumberish, account: string, forkBlock: number): Promise<Signer> => {
  console.log("INIT START");
  forkReset(forkBlock);

  [uadWhale] = await impersonateAccounts([uadWhaleAddress]);
  [ethWhale] = await impersonateAccounts([ethWhaleAddress]);
  const [signer] = await impersonateAccounts([account]);

  // ethWhale to send 100 ethers to uadWhale and account
  await sendEth(ethWhale, uadWhaleAddress, 100);
  await sendEth(ethWhale, account, 100);

  lpContract = new ethers.Contract(UAD3CRVF, IERC20.concat(IUAD3CRF), provider);
  uadContract = new ethers.Contract(UAD, IERC20, provider);
  bondContract = new ethers.Contract(BOND, IBOND, provider);
  bondShareContract = new ethers.Contract(BONDSHARE, IERC1155.concat(IBONDSHARE), provider);

  // uadWhale add liquidity to get LP tokens
  await (await lpContract.connect(uadWhale).add_liquidity([one.mul(50000), 0], 0)).wait();

  // uadWhale to send LP to account
  await (await lpContract.connect(uadWhale).transfer(account, one.mul(amount))).wait();

  await logBalances(account);

  console.log("INIT END");

  return signer;
};

const bondLP = async (amount: BigNumberish, durationWeeks: number, signer: Signer): Promise<number> => {
  let bondId = 0;

  // APPROVE Bonding contract to manage signer LP
  await (await lpContract.connect(signer).approve(bondContract.address, one.mul(amount))).wait();

  // BOND LP in Bonding contract , get back BondingShareId
  const txReceipt: TransactionReceipt = await (await bondContract.connect(signer).deposit(one.mul(amount), durationWeeks)).wait();

  // RETREIVE bonID from logs
  const abi = ["event Deposit(address indexed user, uint256 indexed bondId, uint256 lpAmount, uint256 bondingShareAmount, uint256 weeks, uint256 endBlock)"];
  const iface = new ethers.utils.Interface(abi);
  const topicHash = iface.getEventTopic("Deposit");
  if (txReceipt.logs) {
    const logDescription = txReceipt.logs.find((log: { topics: Array<string> }) => (log.topics[0] === topicHash));
    if (logDescription) {
      let endBlock = 0;
      ({ bondId, endBlock } = iface.parseLog(logDescription).args);
      console.log(`END BLOCK ${endBlock}`);
    }
  }
  return bondId;
}

const unbondLP = async (amount: BigNumberish, bondId: number, signer: Signer) =>
  await (await bondContract.connect(signer).removeLiquidity(one.mul(amount), bondId)).wait();

const priceReset = async () => {

};

// RUN Simulation A
const simulationA = async (amount: BigNumberish, account: string, signer: Signer): Promise<void> => {
  console.log("SIMULATION A START");

  const balanceLPstart = await balanceLP(account);

  console.log("BLOCK", await ethers.provider.getBlockNumber());
  console.log("LP START", balanceLPstart);

  const bondId = await bondLP(amount, 1, signer);
  console.log(`bondId ${bondId}`);

  await mineNBlock(50000, 1);
  console.log("BLOCK", await ethers.provider.getBlockNumber());

  await unbondLP(amount, bondId, signer);
  // await logBalances(account);

  const balanceLPend = await balanceLP(account);

  console.log("LP START", balanceLPstart);
  console.log("LP   END", balanceLPend);

  console.log("SIMULATION A END");
};


// RUN Simulation B
const simulationB = async (amount: BigNumberish, account: string, signer: Signer): Promise<void> => {
  console.log("SIMULATION B START");
  const balanceLPstart = await balanceLP(account);

  console.log("BLOCK", await ethers.provider.getBlockNumber());
  console.log("LP START", balanceLPstart);

  const bondId = await bondLP(amount, 1, signer);
  console.log(`bondId ${bondId}`);

  await mineNBlock(30000, 1);
  console.log("BLOCK", await ethers.provider.getBlockNumber());

  // PRICE RESET : REMOVE LPs from Bonding contract
  await logBalances(bondContract.address);
  await (await bondContract.connect(uadWhale).uADPriceReset(one.mul(100000))).wait();
  await logBalances(bondContract.address);


  await mineNBlock(20000, 1);
  console.log("BLOCK", await ethers.provider.getBlockNumber());

  await unbondLP(amount, bondId, signer);
  // await logBalances(account);

  const balanceLPend = await balanceLP(account);

  console.log("LP START", balanceLPstart);
  console.log("LP   END", balanceLPend);

  console.log("SIMULATION B END");
};



// INIT simulation and RUN A then B
const simulation = async (amount: BigNumberish, account: string, forkBlock: number): Promise<void> => {
  let signer: Signer;

  signer = await simulationInit(amount, account, forkBlock);
  await simulationA(amount, account, signer);

  signer = await simulationInit(amount, account, forkBlock);
  await simulationB(amount, account, signer);
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// => Deposit uAD or 3Crv in Ubiquity Curve MetaPool 3Crv/uAD to get uAD3CRV-f LP tokens
// => Deposit/Bond uAD3CRV-f LP tokens in Ubiquity Bonding to get Bonding Shares
//
// <= Withdraw/Unbond Bonding Shares from Ubiquity Bonding to get back uAD3CRV-f LP tokens 
// <= Withdraw uAD3CRV-f LP tokens from Ubiquity Curve MetaPool 3Crv/uAD to get back uAD or/and 3CRV
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const forkBlock_: number = 13800000;
// const amount_: BigNumber = BigNumber.from(100);
// const testAddress_: string = "0x5824b5adad29331ba03df0238f9424c95613a26f";

const forkBlock_: number = 13800000;
const amount_: BigNumber = BigNumber.from(1000);
const testAddress_: string = "0x4007CE2083c7F3E18097aeB3A39bb8eC149a341d";

simulation(amount_, testAddress_, forkBlock_)
  .then(console.log)
  .catch(console.error)