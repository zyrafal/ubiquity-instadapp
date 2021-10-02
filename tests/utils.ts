import hre from "hardhat";
import hardhatConfig from "../hardhat.config";
import type { Signer } from "ethers";

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

async function sendEth(from: Signer, to: string, amount: number) {
  await from.sendTransaction({
    to: to,
    value: hre.ethers.BigNumber.from(10).pow(18).mul(amount)
  });
}

export { forkReset, sendEth };
