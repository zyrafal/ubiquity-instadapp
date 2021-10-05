import BigNumber from "bignumber.js";
import {
  defineStrategy,
  defineStrategyComponent,
  StrategyComponentType,
  StrategyProtocol
} from "../../helpers";

export default defineStrategy({
  protocol: StrategyProtocol.UBIQUITY,
  name: "Supply",
  description: "Supply DAI USDC or USDT to get Ubiquity Bonding Shares.",

  details: `<p class="text-center">This strategy executes:</p>
  <ul>
    <li>Deposit DAI USDT or USDC</li>
    <li>Get Bonding Shares</li>
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
