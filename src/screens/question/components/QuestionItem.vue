<script lang="ts" setup>
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import type { QuestionInstance } from "@/common/types.ts";
import InputComponent from "@/components/input/InputComponent.vue";
import { ref, } from "vue";
import Next from "@/assets/icons/next.svg";
import SliderCarouselComponent from "@/components/carousel/SliderCarouselComponent.vue";

const props = defineProps<{
  question: QuestionInstance;
}>();
const emit = defineEmits(["next", 'input']);

const answer = ref<any>();

function onSelected(option: string) {
  answer.value = option;
  goNext();
}

function goNext() {
  emit("next", answer.value);
}

function handleInput() {
  emit('input', answer.value)
}
</script>

<template>
  <div class="flex flex-col items-center justify-around h-full overflow-y-auto py-5">
    <p class="font-bold text-center mx-3">{{ props.question.question }}</p>
    <div v-if="props.question.type == 'select'" class="w-full">
      <ButtonComponent v-for="option in props.question.options" :text="option" class="mt-3 mx-auto" style="width: 80%"
        template="primary" @click="onSelected(option)" />
    </div>
    <div v-else-if="props.question.type == 'slider'" class="w-full">
      <SliderCarouselComponent v-model="answer" :max="props.question.max" :min="props.question.min" class="mt-3 mx-auto"
        style="width: 80%" />
    </div>
    <div v-else class="w-2/3">
      <InputComponent ref="inputRef" v-model="answer" :type="props.question.type" @input="handleInput"
        @keydown.enter.prevent="goNext" />
      <ButtonComponent :icon="Next" icon-right template="primary" text="Skip" class="mx-auto mt-2" @click="goNext" />

    </div>
  </div>
</template>

<style scoped></style>