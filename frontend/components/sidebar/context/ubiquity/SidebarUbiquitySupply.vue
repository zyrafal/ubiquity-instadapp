<template>
  <SidebarContextRootContainer>
    <template #title>Deposit</template>

    <div class="flex justify-around items-center w-full">

    <div class="bg-[#C5CCE1] bg-opacity-[0.15] mt-10 p-8">
        <h3 class="text-primary-gray text-lg font-semibold mb-4">
          Deposit DAI
        </h3>

        <InputNumeric />

      <div class="flex flex-shrink-0 mt-10">
        <ButtonCTA
          class="w-full"
          :disabled="!isValid || pending"
          :loading="pending"
        >
          Deposit
        </ButtonCTA>
      </div>

        </div>
      </div>
    </div>
  </SidebarContextRootContainer>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";
import ButtonCTA from "~/components/common/input/ButtonCTA.vue";
import InputNumeric from "~/components/common/input/InputNumeric.vue";

export default defineComponent({
  components: { ButtonCTA, InputNumeric },
  setup() {}
});
</script>
