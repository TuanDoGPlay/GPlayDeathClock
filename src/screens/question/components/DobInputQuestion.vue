<script setup lang="ts">
import Next from '@/assets/icons/next.svg'
import SliderCarouselComponent from '@/components/carousel/SliderCarouselComponent.vue';
import { ref } from 'vue';

const date = ref({
    date: 1,
    month: 1,
    year: 2003
})

const emit = defineEmits(['next'])

function handleSubmit() {

}
</script>


<template>
    <div class=" w-2/3 flex items-center gap-2">
        <SliderCarouselComponent v-model="date.date" :min="1" :max="new Date(date.year, date.month, 0).getDate()"
            :step="1" direction="vertical" />
        <SliderCarouselComponent v-model="date.month" :min="1" :max="12" :step="1" direction="vertical" />
        <SliderCarouselComponent v-model="date.year" :min="1990" :max="new Date().getFullYear()" direction="vertical"
            :step="1" />
    </div>
    <ButtonComponent :icon="Next" icon-right template="primary" text="Next" @click="handleSubmit" />
</template>