<script lang="ts" setup>
import Next from '@/assets/icons/next.svg'
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import SliderCarouselComponent from '@/components/carousel/SliderCarouselComponent.vue';
import { ref } from 'vue';

const date = ref({
  date: 1,
  month: 1,
  year: 2003
})

const emit = defineEmits(['next'])

function handleSubmit() {
  const res = new Date(date.value.year, date.value.month, date.value.date)
  emit('next', res)
}
</script>


<template>
  <div class=" w-4/5 flex items-center gap-1" style="height: 60%;">
    <SliderCarouselComponent v-model="date.date" :max="new Date(date.year, date.month, 0).getDate()" :min="1" :step="1"
      direction="vertical" />
    <SliderCarouselComponent v-model="date.month" :max="12" :min="1" :step="1" direction="vertical" />
    <SliderCarouselComponent v-model="date.year" :max="new Date().getFullYear()" :min="1950" :step="1"
      direction="vertical" />
  </div>
  <ButtonComponent :icon="Next" icon-right template="primary" text="Next" @click="handleSubmit" />
</template>

<style scoped>
.separator {
  color: var(--highlight-text);
  font-size: 1.5rem;
  font-weight: 700;
  align-self: center;
  flex-shrink: 0;
}
</style>