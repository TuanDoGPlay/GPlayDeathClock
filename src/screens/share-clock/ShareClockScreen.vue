<script lang="ts" setup>
import SelectTemplate from "./components/SelectTemplate.vue";
import TemplateDisplay from "./components/TemplateDisplay.vue";
import {ref} from "vue";
import {EventEnum} from "@/constants/events.ts";

const selectedTemplate = ref(0)

function onTemplateSelected(id: number) {
  selectedTemplate.value = id
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: false}}))
}
</script>

<template>
  <div class="h-full">
    <SelectTemplate v-if="!selectedTemplate" @select="onTemplateSelected"/>
    <TemplateDisplay v-else :template-id="selectedTemplate" @back="selectedTemplate = 0"/>
  </div>
</template>

<style scoped>

</style>