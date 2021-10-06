import uad3crvf from "./uad3crvf.json";
import { ethers } from "ethers";
const { utils } = ethers;
const { Interface, FormatTypes, FunctionFragment } = utils;

const main = async function () {
  const iface = new Interface(JSON.stringify(uad3crvf));
  console.log("full", iface.format(FormatTypes.full));

  iface.fragments.forEach((frag) => {
    if (FunctionFragment.isFunctionFragment(frag)) {
      console.log(iface.getSighash(frag), frag.format(FormatTypes.minimal));
    }
  });
};
main();
