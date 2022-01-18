<template>
  <SidebarContextRootContainer>
    <template #title>
      <h1 class="font-bold text-primary-black text-lg">APE INTO LP</h1>
      <p class="font-medium text-[#1874FF] text-sm mt-2.5">Created by the Ubituity Team</p>
      <div class="flex-shrink-0 font-medium prose prose-sm text-primary-gray text-left mt-[24px] mx-[32px]">
        <ul>
          <li>Deposits Stablecoins into {{ symbol }}</li>
          <li>Stakes and lockups LP tokens for UBQ Rewards</li>
        </ul>
      </div>
    </template>
<!-- 
    <SidebarSectionValueWithIcon label="Token Balance" center>
      <template #icon
        ><IconCurrency currency="crv3" class="w-20 h-20" noHeight
      /></template>
      <template #value>{{ formatDecimal(balance) }} {{ symbol }}</template>
    </SidebarSectionValueWithIcon> -->

    <div class="bg-[#C5CCE1] bg-opacity-[0.15] mt-10 p-8">
      <h3 class="text-primary-gray text-xs font-semibold mb-2.5">
        TOKEN TO ZAP
      </h3>

      <input-amount
        :value="amount"
        :token-key="'dai'"
        :token-keys="['dai', 'usdt', 'usdc']"
        :error="null"
        placeholder="0 DAI"
        @input="$event => {}"
        @tokenKeyChanged="
          tokenKey => {
          }
        "
      />

      <h3 class="text-primary-gray text-xs font-semibold mb-2.5">
        LOCKUP TIME IN WEEKS
      </h3>
      <input-numeric
        v-model="amount"
        placeholder="1 - 208 weeks"
        :error="errors.amount.message"
      >
        <template v-if="!isMaxAmount" #suffix>
          <div class="absolute mt-2 top-0 right-0 mr-4">
            <!-- <button
              type="button"
              class="text-primary-blue-dark font-semibold text-sm hover:text-primary-blue-hover"
              @click="toggle"
            >
              Max
            </button> -->
          </div>
        </template>
      </input-numeric>

      <h3 class="text-primary-gray text-xs font-semibold mb-2.5 mt-8">
        ESTIMATED LP VALUE
      </h3>
      <div class="flex items-center">
        <IconCurrency currency="crv3" class="w-12 h-12" no-height />
        <div class="flex flex-col flex-grow mx-2">
          <div class="mb-1 font-medium leading-none whitespace-no-wrap text-18">{{ uadcrv3.usd }}</div>
          <div class="flex leading-none whitespace-no-wrap">
            <span class="text-grey-pure text-12 leading-[17px]">{{ uadcrv3.lp }}</span>
            <Info :text="uadcrv3.info" icon="price" class="ml-1" />
          </div>
        </div>
      </div>

      <ValidationErrors :error-messages="errorMessages" class="mb-6" />
      <div class="flex flex-shrink-0 mt-10">
        <!-- :disabled="!isValid || pending" -->
        <ButtonCTA class="w-full" :loading="pending" @click="cast">
          APE IN
        </ButtonCTA>
      </div>
      <h3 class="text-primary-gray text-xs mt-2.5 text-center">
        Instadapp does not charge a fee for this operation
      </h3>

    </div>
  </SidebarContextRootContainer>
</template>

<script>
import { computed, defineComponent, ref } from "@nuxtjs/composition-api";
import InputNumeric from "~/components/common/input/InputNumeric.vue";
import InputAmount from "~/components/common/input/InputAmount.vue";
import { useBalances } from "~/composables/useBalances";
import { useNotification } from "~/composables/useNotification";
import { useBigNumber } from "~/composables/useBigNumber";
import { useFormatting } from "~/composables/useFormatting";
import { useValidators } from "~/composables/useValidators";
import { useValidation } from "~/composables/useValidation";
import { useToken } from "~/composables/useToken";

import { useParsing } from "~/composables/useParsing";
import { useMaxAmountActive } from "~/composables/useMaxAmountActive";
import { useWeb3 } from "@instadapp/vue-web3";
import ToggleButton from "~/components/common/input/ToggleButton.vue";
import { useDSA } from "~/composables/useDSA";
import ButtonCTA from "~/components/common/input/ButtonCTA.vue";
import Button from "~/components/Button.vue";
import { useSidebar } from "~/composables/useSidebar";
import { useUbiquityPosition } from "~/composables/protocols/useUbiquityPosition";

export default defineComponent({
  components: { InputNumeric, InputAmount, ToggleButton, ButtonCTA, Button },
  setup() {
    const { close } = useSidebar();
    const { account } = useWeb3();
    const { dsa } = useDSA();
    const { valInt, getTokenByKey } = useToken();
    const { getBalanceByKey, fetchBalances } = useBalances();
    const { formatDecimal, formatUsd, formatNumber } = useFormatting();
    const { isZero } = useBigNumber();
    const { parseSafeFloat } = useParsing();
    const {
      showPendingTransaction,
      showConfirmedTransaction,
      showWarning
    } = useNotification();

    const amount = ref("");
    const amountParsed = computed(() => parseSafeFloat(amount.value));

    const { fetchPosition, datas } = useUbiquityPosition();

    const tokenKey = ref("uadcrv3");
    const balance = computed(() => getBalanceByKey(tokenKey.value));
    const token = computed(() => getTokenByKey(tokenKey.value));
    const symbol = computed(() => token.value?.symbol);
    const decimals = computed(() => token.value?.decimals);

    const { toggle, isMaxAmount } = useMaxAmountActive(amount, balance);

    const formatNumber18 = value =>
      formatNumber(
        ensureValue(value)
          .dividedBy(1e18)
          .toFixed()
      );

    const formatNumber18usd = value => formatUsd(formatNumber18(value));

    const { validateAmount, validateIsLoggedIn } = useValidators();

    const uadcrv3 = computed(() => {
      return {
        usd: '$156,029',
        lp: `4.20 UAD3CRV-LP`,
        info: `$200.00/UAD3CRV-LP`
      }
    })

    const errors = computed(() => {
      const hasAmountValue = !isZero(amount.value);

      return {
        amount: {
          message: validateAmount(amountParsed.value, balance.value),
          show: hasAmountValue
        },
        auth: { message: validateIsLoggedIn(!!account.value), show: true }
      };
    });
    const { errorMessages, isValid } = useValidation(errors);

    const pending = ref(false);

    async function cast() {
      pending.value = true;

      const amount = isMaxAmount.value
        ? dsa.value.maxValue
        : valInt(amountParsed.value, decimals.value);

      console.log(amount);
      const spells = dsa.value.Spell();
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const ubiquityProd = "UBIQUITY-A";

      spells.add({
        connector: ubiquityProd,
        method: "deposit",
        args: [DAI, amount, 4, 0, 0]
      });

      try {
        const txHash = await dsa.value.cast({
          spells,
          from: account.value,
          onReceipt: async receipt => {
            showConfirmedTransaction(receipt.transactionHash);

            await fetchBalances(true);
            await fetchPosition();
          }
        });

        showPendingTransaction(txHash);
      } catch (error) {
        showWarning(error.message);
      }

      pending.value = false;

      close();
    }

    return {
      tokenKey,
      symbol,
      balance,
      datas,
      amount,
      uadcrv3,
      formatDecimal,
      formatUsd,
      formatNumber18usd,
      errors,
      errorMessages,
      isMaxAmount,
      isValid,
      cast,
      pending,
      toggle
    };
  }
});
</script>
