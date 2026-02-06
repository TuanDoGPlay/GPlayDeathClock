<script setup lang="ts">
import ButtonComponent from "@/components/button/ButtonComponent.vue";
const emit = defineEmits(['next'])
</script>

<template>
  <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
    <p class="font-bold text-center mb-10">Do you smoke1?</p>
    <ButtonComponent style="width: 80%" template="primary" text="Yes, a lot" @click="emit('next')"/>
    <ButtonComponent style="width: 80%" template="primary" text="Yes, sometimes" @click="emit('next')"/>
    <ButtonComponent style="width: 80%" template="primary" text="Never" @click="emit('next')"/>
  </div>
</template>

<style scoped>

</style>