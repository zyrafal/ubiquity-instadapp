import type { DeployFunction } from "hardhat-deploy/types";
import { BigNumber, Signer } from "ethers";
import type { EthereumProvider } from "hardhat/types";
import addresses from "../scripts/constant/addresses";
import abis from "../scripts/constant/abis";
import { sendTx, sendTxEth } from "../tests/utils/sendTx";

async function sendEth(from: Signer, to: string, value: BigNumber) {
  await from.sendTransaction({ to, value });
}
async function impersonate(account: string, provider: EthereumProvider) {
  await provider.request({
    method: "hardhat_impersonateAccount",
    params: [account]
  });
}

const deployInstaUbiquityConnectorFunction: DeployFunction = async function ({
  deployments,
  ethers,
  network,
  getNamedAccounts
}) {
  const deployer = await ethers.getNamedSigner("deployer");
  const { ethWhale: ethWhaleAddress, uadWhale: uadWhaleAddress } = await getNamedAccounts();

  const connectV2Ubiquity = await deployments.deploy("ConnectV2Ubiquity", {
    args: [],
    from: deployer.address,
    log: true
  });

  if (connectV2Ubiquity.newlyDeployed) {
    const one = BigNumber.from(10).pow(18);
    const ubiquityTest = "Ubiquity-v1";
    const url = `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_PATH}`;
    const ABI = ["function transfer(address to, uint amount) returns (boolean)"];
    const UAD = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
    const UAD3CRVF = "0x20955CB69Ae1515962177D164dfC9522feef567E";
    const uADContract = new ethers.Contract(UAD, ABI, ethers.provider);
    const uAD3CRVfContract = new ethers.Contract(UAD3CRVF, ABI, ethers.provider);

    let instaIndex = new ethers.Contract(addresses.core.instaIndex, abis.core.instaIndex, deployer);
    const masterAddress = await instaIndex.master();
    const instaConnectorsV2 = new ethers.Contract(addresses.core.connectorsV2, abis.core.connectorsV2, ethers.provider);

    if (network.name == "hardhat") {
      impersonate(ethWhaleAddress, network.provider);
      impersonate(uadWhaleAddress, network.provider);
      impersonate(masterAddress, network.provider);

      let ethWhale = await ethers.getSigner(ethWhaleAddress);
      let uadWhale = await ethers.getSigner(uadWhaleAddress);
      let master = await ethers.getSigner(masterAddress);
      await ethWhale.sendTransaction({ to: deployer.address, value: one.mul(1000) });
      await deployer.sendTransaction({ to: masterAddress, value: one.mul(100) });
      await uADContract.connect(uadWhale).transfer(deployer.address, one.mul(1000));
      await uAD3CRVfContract.connect(uadWhale).transfer(deployer.address, one.mul(5000));
      await instaConnectorsV2.connect(master).addConnectors([ubiquityTest], [connectV2Ubiquity.address]);
    }
    // NETWORK TENDERLY FORK
    else if (network.name == "tenderly") {
      await sendTxEth(url, ethWhaleAddress, deployer.address, one.mul(1000));
      await sendTxEth(url, deployer.address, masterAddress, one.mul(100));

      const tx1 = await uADContract.populateTransaction.transfer(deployer.address, one.mul(1000));
      tx1.from = uadWhaleAddress;
      await sendTx(url, tx1);

      const tx2 = await uAD3CRVfContract.populateTransaction.transfer(deployer.address, one.mul(5000));
      tx2.from = uadWhaleAddress;
      await sendTx(url, tx2);

      const tx3 = await instaConnectorsV2.populateTransaction.addConnectors(
        [ubiquityTest],
        [connectV2Ubiquity.address]
      );
      tx3.from = masterAddress;
      await sendTx(url, tx3);
    }
    // addresses.connectors[ubiquityTest] = connector.address;
  }
};
deployInstaUbiquityConnectorFunction.tags = ["InstaUbiquityConnector"];

export default deployInstaUbiquityConnectorFunction;
