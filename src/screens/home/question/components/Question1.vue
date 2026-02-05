<script setup lang="ts">

import ButtonComponent from "@/components/button/ButtonComponent.vue";
</script>

<template>
  <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
    <p class="font-bold text-center mb-10">Do you smoke1?</p>
    <ButtonComponent style="width: 80%" template="primary" text="Yes, a lot"/>
    <ButtonComponent style="width: 80%" template="primary" text="Yes, sometimes"/>
    <ButtonComponent style="width: 80%" template="primary" text="Never"/>
  </div>
</template>

<style scoped>

</style>