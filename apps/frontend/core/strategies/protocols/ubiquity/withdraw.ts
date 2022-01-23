import BigNumber from "bignumber.js";
import {
  defineStrategy,
  defineStrategyComponent,
  StrategyComponentType,
  StrategyProtocol
} from "../../helpers";

export default defineStrategy({
  protocol: StrategyProtocol.UBIQUITY,
  name: "Withdraw",
  description: "Withdraw uAD",

  details: `<p class="text-center">This strategy executes:</p>
  <ul>
    <li>Withdraw uAD, UBQ , Bonding Shares</li>
    <li>Get DAI USDC or USDT</li>
  </ul>`,

  submitText: "Supply",

  author: "Ubiquity Team",

  variables: {},

  components: [],

  validate: async ({
    position,
    components: inputs,
    toBN,
    tokenIdMapping
  }) => {},

  spells: async ({
    components: inputs,
    convertTokenAmountToWei,
    tokenIdMapping
  }) => {
    return [];
  }
});
