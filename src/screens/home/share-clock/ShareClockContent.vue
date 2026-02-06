<script lang="ts" setup>

import SelectTemplate from "@/screens/home/share-clock/components/SelectTemplate.vue";
import TemplateDisplay from "@/screens/home/share-clock/components/TemplateDisplay.vue";
import {ref} from "vue";
import {EventEnum} from "@/constants/events.ts";

const selectedTemplate = ref(1)

function selectTemplate(id: number) {
  selectedTemplate.value = id
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: false}}))
}
</script>

<template>
  <div class="h-full">
    <SelectTemplate v-if="!selectedTemplate" @select="selectTemplate"/>
    <TemplateDisplay v-else :template-id="selectedTemplate" @back="selectedTemplate = 0"/>
  </div>
</template>

<style scoped>

</style>