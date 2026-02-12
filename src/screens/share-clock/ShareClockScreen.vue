<script lang="ts" setup>
import {ref} from 'vue';
import SelectTemplate from "@/screens/share-clock/components/SelectTemplate.vue";
import TemplateDisplay from "@/screens/share-clock/components/TemplateDisplay.vue";
import {EventEnum} from "@/constants/events.ts";

const selectedTemplate = ref(0);
const transitionName = ref<'zoom-in' | 'zoom-out'>('zoom-in');

const onTemplateSelected = (id: number) => {
  transitionName.value = 'zoom-in';
  selectedTemplate.value = id;
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: false}}))
};

const handleBack = () => {
  transitionName.value = 'zoom-out';
  selectedTemplate.value = 0;
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: true}}))
};
</script>

<template>
  <div class="h-full w-full relative overflow-hidden bg-white">
    <Transition :name="transitionName" mode="out-in">
      <SelectTemplate
          v-if="!selectedTemplate"
          key="list"
          class="h-full w-full"
          @select="onTemplateSelected"
      />

      <TemplateDisplay
          v-else
          key="detail"
          :template-id="selectedTemplate"
          class="h-full w-full"
          @back="handleBack"
      />
    </Transition>
  </div>
</template>

<style scoped>
.zoom-in-enter-active,
.zoom-in-leave-active,
.zoom-out-enter-active,
.zoom-out-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform, opacity;
}

.zoom-in-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.zoom-in-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.zoom-out-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.zoom-out-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>