<template>
  <SidebarContextRootContainer>
    <template #title>Deposit {{ symbol }}</template>

    <SidebarSectionValueWithIcon label="Token Balance" center>
      <template #icon
        ><IconCurrency :currency="tokenKey" class="w-20 h-20" noHeight
      /></template>
      <template #value>{{ formatDecimal(balance) }} {{ symbol }}</template>
    </SidebarSectionValueWithIcon>

    <div class="bg-[#C5CCE1] bg-opacity-[0.15] mt-10 p-8">
      <h3 class="text-primary-gray text-xs font-semibold mb-2.5">
        Amount to supply
      </h3>

      <input-numeric
        v-model="amount"
        placeholder="Amount to supply"
        :error="errors.amount.message"
      >
        <template v-if="!isMaxAmount" #suffix>
          <div class="absolute mt-2 top-0 right-0 mr-4">
            <button
              type="button"
              class="text-primary-blue-dark font-semibold text-sm hover:text-primary-blue-hover"
              @click="toggle"
            >
              Max
            </button>
          </div>
        </template>
      </input-numeric>

      <div class="flex flex-shrink-0 mt-10">
        <!-- :disabled="!isValid || pending" -->
        <ButtonCTA class="w-full" :loading="pending" @click="cast">
          Supply
        </ButtonCTA>
      </div>

      <ValidationErrors :error-messages="errorMessages" class="mt-6" />
    </div>
  </SidebarContextRootContainer>
</template>

<script>
import { computed, defineComponent, ref } from "@nuxtjs/composition-api";
import InputNumeric from "~/components/common/input/InputNumeric.vue";
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
  components: { InputNumeric, ToggleButton, ButtonCTA, Button },
  setup() {
    const { close } = useSidebar();
    const { account } = useWeb3();
    const { dsa } = useDSA();
    const { valInt, getTokenByKey } = useToken();
    const { getBalanceByKey, fetchBalances } = useBalances();
    const { formatDecimal } = useFormatting();
    const { isZero } = useBigNumber();
    const { parseSafeFloat } = useParsing();
    const {
      showPendingTransaction,
      showConfirmedTransaction,
      showWarning
    } = useNotification();

    const amount = ref("");
    const amountParsed = computed(() => parseSafeFloat(amount.value));

    const { fetchPosition } = useUbiquityPosition();

    const tokenKey = ref("dai");
    const balance = computed(() => getBalanceByKey(tokenKey.value));
    const token = computed(() => getTokenByKey("dai"));
    const symbol = computed(() => token.value?.symbol);
    const decimals = computed(() => token.value?.decimals);

    const { toggle, isMaxAmount } = useMaxAmountActive(amount, balance);

    const { validateAmount, validateIsLoggedIn } = useValidators();
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
      const ubiquityTest = "Ubiquity-v1";

      spells.add({
        connector: ubiquityTest,
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
      amount,
      formatDecimal,
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
