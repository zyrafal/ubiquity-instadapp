import BigNumber from "bignumber.js";
import {
  defineStrategy,
  defineStrategyComponent,
  StrategyComponentType,
  StrategyProtocol
} from "../../helpers";

export default defineStrategy({
  protocol: StrategyProtocol.UBIQUITY,
  name: "Yield",
  description: "Yield Aggregator",

  details: `<p class="text-center">This strategy executes:</p>
  <ul>
    <li>...</li>
    <li>...</li>
  </ul>`,

  submitText: "Yield Aggregator",

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
