import hre from "hardhat";
import hardhatConfig from "../hardhat.config";
import type { Signer, BigNumber } from "ethers";

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

async function sendEth(from: Signer, to: string, value: BigNumber) {
  await from.sendTransaction({
    to,
    value
  });
}

export { forkReset, sendEth };
