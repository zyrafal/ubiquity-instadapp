import BigNumber from "bignumber.js";
import {
  defineStrategy,
  defineStrategyComponent,
  StrategyComponentType,
  StrategyProtocol
} from "../../helpers";

export default defineStrategy({
  protocol: StrategyProtocol.UBIQUITY,
  name: "APE INTO LP",
  description: "Supply DAI USDC or USDT to get Ubiquity Bonding Shares.",

  details: `<p class="text-center">This strategy executes:</p>
  <ul>
    <li>Deposits Stablecoins into UAD3CRV-LP</li>
    <li>Stakes and lockups LP tokens for UBQ Rewards</li>
  </ul>`,

  submitText: "APE IN",

  author: "Created by the Ubituity Team",

  variables: {},

  components: [
    defineStrategyComponent({
      type: StrategyComponentType.INPUT_WITH_TOKEN,
      name: "Collateral",
      placeholder: ({ component: input }) =>
        input.token ? `${input.token.symbol} to Deposit` : "",
      validate: ({ component: input, dsaBalances, toBN }) => {
        if (!input.token) {
          return "Collateral token is required";
        }

        if (!input.value) {
          return "Collateral amount is required";
        }

        const collateralBalance = toBN(
          dsaBalances[input.token.address]?.balance
        );

        if (toBN(collateralBalance).lt(input.value)) {
          const collateralBalanceFormatted = collateralBalance.toFixed(2);
          return `Your amount exceeds your maximum limit of ${collateralBalanceFormatted} ${input.token.symbol}`;
        }
      },
      defaults: ({ getTokenByKey, variables }) => ({
        token: getTokenByKey?.(variables.collateralTokenKey)
      })
    }),
    defineStrategyComponent({
      type: StrategyComponentType.INPUT_NUMERIC,
      name: "Collateral",
      placeholder: ({ component: input }) =>
        "1 - 208 weeks",
      validate: ({ component: input, dsaBalances, toBN }) => {
        if (!input.token) {
          return "Collateral token is required";
        }

        if (!input.value) {
          return "Collateral amount is required";
        }

        const collateralBalance = toBN(
          dsaBalances[input.token.address]?.balance
        );

        if (toBN(collateralBalance).lt(input.value)) {
          const collateralBalanceFormatted = collateralBalance.toFixed(2);
          return `Your amount exceeds your maximum limit of ${collateralBalanceFormatted} ${input.token.symbol}`;
        }
      },
      defaults: ({ getTokenByKey, variables }) => ({
        token: getTokenByKey?.(variables.collateralTokenKey)
      })
    }),
  ],

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
