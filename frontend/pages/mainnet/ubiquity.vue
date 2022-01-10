<template>
  <div>
    <div>
      <nuxt-link
        to="/"
        class="text-[#C0C5D7] text-lg font-semibold flex items-center"
      >
        <BackIcon class="w-4 h-4 mr-3" />
        Apps
      </nuxt-link>
    </div>

    <div class="mt-10 flex items-center justify-between">
      <div class="flex items-center">
        <div
          style="background: radial-gradient(42.15% 42.15% at 48.94% 48.94%, #D6DAE0 75.67%, #F0F3F9 100%), #C4C4C4;"
          class="w-16 h-16 rounded-full flex items-center justify-center border border-[#CCDCF3]"
        >
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center bg-[#1874FF]"
          >
            <UbiquityIcon class="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 class="ml-4 text-primary-black text-2xl font-semibold">Ubiquity DAO</h1>
      </div>

      <ButtonCTAOutlined
        class="px-4 h-9 w-[173px]"
        @click="$router.push({ hash: 'strategies?protocol=ubiquity' })"
      >
        Strategies

        <svg
          class="ml-auto"
          width="11"
          height="10"
          viewBox="0 0 11 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.3815 8.76139C4.38149 8.99703 4.64068 9.1407 4.8405 9.01581L10.859 5.25425C11.047 5.13675 11.047 4.86295 10.859 4.74545L4.84088 0.984069C4.64108 0.859187 4.38189 1.00283 4.38188 1.23845L4.38179 2.97869C4.38178 3.14437 4.24747 3.27867 4.08179 3.27867L1.23894 3.27867C1.07325 3.27867 0.93894 3.41299 0.93894 3.57867L0.93894 6.42096C0.93894 6.58664 1.07325 6.72096 1.23894 6.72096L4.08159 6.72096C4.24728 6.72096 4.3816 6.85528 4.38159 7.02097L4.3815 8.76139Z"
            fill="#1874FF"
          />
        </svg>
      </ButtonCTAOutlined>
    </div>

    <div class="mt-10">
      <h2 class="text-primary-gray text-lg font-semibold">Overview</h2>

      <div
        class="px-1 mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 xl:gap-[18px]"
      >
        <div class="shadow rounded-lg p-0 flex">
          <div class="flex flex-1 flex-col justify-between py-6 px-6">
            <h4 class="text-xl text-primary-black font-semibold">
              Stabilize Liquity Protocol
            </h4>
            <!-- <a class="mt-4 text-[#1874FF] text-right font-medium cursor-pointer">
              - Learn More -
            </a> -->
          </div>
          <div class="flex items-center justify-center rounded-r-lg bg-[#1874FF] w-[50px]">
            <SVGScale class="h-12 text-white" />
          </div>
        </div>
        <div class="shadow rounded-lg p-0 flex">
          <div class="flex flex-1 flex-col justify-between py-6 px-6">
            <h4 class="text-xl text-primary-black font-semibold">
              Get Passive Yield on Your LUSD
            </h4>
            <!-- <a class="mt-4 text-[#1874FF] text-right font-medium cursor-pointer">
              - Learn More -
            </a> -->
          </div>
          <div class="flex items-center justify-center rounded-r-lg bg-[#1874FF] w-[50px]">
            <SVGWaterDrop class="h-12 text-white" />
          </div>
        </div>
        <div class="shadow rounded-lg p-0 flex">
          <div class="flex flex-1 flex-col justify-between py-6 px-6">
            <h4 class="text-xl text-primary-black font-semibold">
              Improved Liquidity Mining Program
            </h4>
            <!-- <a class="mt-4 text-[#1874FF] text-right font-medium cursor-pointer">
              - Learn More -
            </a> -->
          </div>
          <div class="flex items-center justify-center rounded-r-lg bg-[#1874FF] w-[50px]">
            <SVGSavingMoney class="h-12 text-white" />
          </div>
        </div>
        <!-- <div class="shadow rounded-lg py-8 px-6 flex">
          <div class="flex-1">
            <h3 class="text-2xl text-primary-black font-medium">
              {{ formatNumber18usd(datas.twapPrice) }}
            </h3>
            <p class="mt-4 text-primary-gray font-medium">
              uAD Price
            </p>
          </div>
          <div class="flex items-center">
            <SVGPrice class="h-12 text-primary-gray" />
          </div>
        </div> -->
      </div>

      <div
        class="px-1 mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-[18px]"
      >
        <div class="shadow rounded-lg py-8 px-6 flex">
          <div
            style="background: radial-gradient(42.15% 42.15% at 48.94% 48.94%, #D6DAE0 75.67%, #F0F3F9 100%), #C4C4C4;"
            class="w-16 h-16 rounded-full mr-4 flex items-center justify-center border border-[#CCDCF3]"
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center bg-[#00E5DC]"
            >
              <SVGUad class="w-8 h-8 text-black" />
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl text-primary-black font-medium">
              {{ formatNumber18usd(datas.twapPrice) }}
            </h3>
            <p class="mt-2 text-primary-gray font-medium">
              uAD Twap Price
            </p>
          </div>
          <div class="flex items-center">
            <SVGDiscount class="h-12 text-primary-gray" />
          </div>
        </div>
        <div class="shadow rounded-lg py-8 px-6 md:flex justify-between block">
          <div class="flex">
            <div
              style="background: radial-gradient(42.15% 42.15% at 48.94% 48.94%, #D6DAE0 75.67%, #F0F3F9 100%), #C4C4C4;"
              class="w-16 h-16 rounded-full mr-4 flex items-center justify-center border border-[#CCDCF3]"
            >
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center bg-[#00E5DC]"
              >
                <UbiquityIcon class="w-8 h-8 text-black" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl text-primary-black font-medium">
                {{ formatNumber18usd(datas.uadTotalSupply) }}
              </h3>
              <p class="mt-2 text-primary-gray font-medium">
                UBQ Rewards
              </p>
            </div>
          </div>
          <div class="flex items-center mt-4 md:mt-0">
            <button
              class="flex items-center uppercase justify-center flex-shrink-0 py-2 font-semibold text-white whitespace-no-wrap duration-75 ease-out transform rounded-[4px] select-none bg-ocean-blue-pure shadow-cta focus:outline-none dark:shadow-none px-8 h-12 w-full hover:-translate-y-px active:translate-y-px"
              @click="openSupply"
            >
              Claim All
            </button>
          </div>
        </div>
      </div>

      <div class="mt-[60px]" v-if="position">
        <div
          class="w-full flex flex-col mt-6 sm:flex-row sm:items-center sm:justify-start xl:mt-4"
        >
          <div class="flex items-center">
            <SVGGorilla class="h-12 text-primary-gray" />
          </div>
          <h2 class="text-primary-gray pl-2 text-lg font-semibold">
            Ape into uAD pools
          </h2>
        </div>

        <div
          class="px-1 mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-1 xl:gap-[18px]"
        >
          <div
            class="flex-shrink-0 bg-white rounded-lg relative flex flex-col flex-1 px-4 pt-4 pb-6 dark:bg-dark-500"
            style="box-shadow: -1px -3px 10px rgba(12, 25, 91, 0.03), 2px 4px 12px rgba(12, 25, 91, 0.05)"
          >
            <div class="flex items-center">
              <IconCurrency currency="crv3" class="w-12 h-12" no-height />
              <div class="flex flex-col flex-grow mx-4">
                <div class="mb-1 font-medium leading-none whitespace-no-wrap text-19">{{ formatNumber18usd(datas.uadcrv3TotalSupply) }}</div>
                <div class="flex leading-none whitespace-no-wrap">
                  <span class="text-grey-pure text-14">{{ formatDecimal(4.2) }} {{ symbol }}</span>
                  <Info :text="`${formatUsd(200, 2)}/${symbol}`" icon="price" class="ml-1" />
                </div>
              </div>
              <div class="self-start">
                <Badge color="blue" class="w-16">STAKED</Badge>
              </div>
            </div>

            <div class="block md:flex items-center justify-between px-0 mt-6">
              <button class="h-10 md:w-[24%] mt-2 md:mt-0 uppercase w-full text-primary-blue-dark shadow border border-primary-blue-dark hover:border-primary-blue-hover rounded-[4px] hover:text-primary-blue-hover" @click="showApeIn">Ape in</button>
              <button class="h-10 md:w-[24%] mt-2 md:mt-0 uppercase w-full text-primary-blue-dark shadow border border-primary-blue-dark hover:border-primary-blue-hover rounded-[4px] hover:text-primary-blue-hover" color="ocean-blue" @click="showWithdraw">Withdraw</button>
              <button class="h-10 md:w-[24%] mt-2 md:mt-0 uppercase w-full text-primary-blue-dark shadow border border-primary-blue-dark hover:border-primary-blue-hover rounded-[4px] hover:text-primary-blue-hover" color="ocean-blue" @click="showStake">Stake</button>
              <button class="h-10 md:w-[24%] mt-2 md:mt-0 uppercase w-full text-primary-blue-dark shadow border border-primary-blue-dark hover:border-primary-blue-hover rounded-[4px] hover:text-primary-blue-hover" color="ocean-blue" @click="showUnstake">Unstake</button>
            </div>

            <hr class="mt-4" />
            <p class="mt-4 text-primary-gray font-medium text-xl text-center">
              Remaining Lockup Time: Approximately 13 days
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, useRouter } from "@nuxtjs/composition-api";
import BackIcon from "~/assets/icons/back.svg?inline";
import { useUbiquityPosition } from "~/composables/protocols/useUbiquityPosition";
import { useFormatting } from "~/composables/useFormatting";
import { useSearchFilter } from "~/composables/useSearchFilter";
import { useStatus } from "~/composables/useStatus";
import { useBigNumber } from "~/composables/useBigNumber";
import { useNotification } from "~/composables/useNotification";
import { useToken } from '~/composables/useToken'

import SVGBalance from "@/assets/img/icons/balance.svg?inline";
import SVGPrice from "@/assets/img/icons/price.svg?inline";
import SVGPercent from "@/assets/img/icons/percent.svg?inline";

import UbiquityIcon from "~/assets/icons/ubiquity.svg?inline";
import SVGUad from "~/assets/icons/uad.svg?inline";
import SVGScale from "~/assets/icons/scale.svg?inline";
import SVGWaterDrop from "~/assets/icons/water-drop.svg?inline";
import SVGSavingMoney from "~/assets/icons/saving-money.svg?inline";
import SVGDiscount from "~/assets/icons/discount.svg?inline";
import SVGGorilla from "~/assets/icons/gorilla.svg?inline";
import SVGCrv3 from "~/assets/icons/crv3.svg?inline";

import ButtonCTAOutlined from "~/components/common/input/ButtonCTAOutlined.vue";
import UbqInput from "~/components/common/input/InputNumeric.vue";

export default defineComponent({
  components: {
    SVGBalance,
    SVGPrice,
    SVGScale,
    SVGWaterDrop,
    SVGSavingMoney,
    SVGDiscount,
    SVGGorilla,
    SVGPercent,
    SVGCrv3,
    SVGUad,
    BackIcon,
    UbiquityIcon,
    UbqInput,
    ButtonCTAOutlined
  },
  setup() {
    const router = useRouter();
    const { isZero, ensureValue, times, div, max, gt, toBN } = useBigNumber();
    const { getTokenByKey } = useToken()

    const {
      formatUsd,
      formatUsdMax,
      formatPercent,
      formatDecimal,
      formatNumber,
      shortenHash
    } = useFormatting();

    const { showWarning } = useNotification();

    const { addresses, datas, inventory } = useUbiquityPosition();
    console.log('===================================')
    console.log(addresses, datas, inventory)
    console.log('===================================')

    const tokenKey = 'uadcrv3';
    const symbol = computed(() => getTokenByKey(tokenKey)?.symbol || tokenKey)

    const position = true;

    const formatNumber18 = value =>
      formatNumber(
        ensureValue(value)
          .dividedBy(1e18)
          .toFixed()
      );

    const formatNumber18usd = value => formatUsd(formatNumber18(value));

    function openSupply() {
      router.push({ hash: "usupply" });
    }

    function showApeIn() {
      router.push({ hash: "uad3crvsupply" });
      // showWarning("UbiquityDAO", "No UAD3CRV supplied!!");
    }

    function showWithdraw() {
      showWarning("UbiquityDAO", "No UAD3CRV supplied!!");
    }

    function showStake() {
      router.push({ hash: "uad3crvstake" });
      // showWarning("UbiquityDAO", "No UAD3CRV supplied!!");
    }

    function showUnstake() {
      showWarning("UbiquityDAO", "No UAD3CRV supplied!!");
    }

    return {
      position,
      addresses,
      datas,
      inventory,
      symbol,
      formatUsd,
      formatNumber,
      formatNumber18,
      formatNumber18usd,
      formatUsdMax,
      formatPercent,
      formatDecimal,
      shortenHash,
      openSupply,
      showApeIn,
      showWithdraw,
      showStake,
      showUnstake
    };
  }
});
</script>
