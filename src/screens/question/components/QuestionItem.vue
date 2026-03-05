<script lang="ts" setup>
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import type { QuestionData } from "@/common/types.ts";
import InputComponent from "@/components/input/InputComponent.vue";
import { onMounted, ref, watch, nextTick } from "vue";
import { showToast } from "gplay-app-sdk";

const props = defineProps<{
  question: QuestionData;
  focus?: boolean;
}>();
const emit = defineEmits(["next", 'input']);

const answer = ref<any>();
const inputRef = ref<any>();

const focusInput = async () => {
  await nextTick();
  const inputElement =
    inputRef.value?.$el?.querySelector("input") ||
    inputRef.value?.querySelector?.("input");
  inputElement?.focus?.();
};

onMounted(() => {
  if (props.focus && props.question.type !== "select") {
    focusInput();
  }
});

// chỉ focus khi focus=true (và không phải select)
watch(
  () => props.focus,
  (v) => {
    if (v && props.question.type !== "select") focusInput();
  },
  { immediate: false }
);

function onSelected(option: string) {
  answer.value = option;
  goNext();
}

function goNext() {
  if (!answer.value) {
    showToast({ text: "Please answer this question" });
    return;
  }
  emit("next", answer.value);
}

function handleInput() {
  emit('input', answer.value)
}
</script>

<template>
  <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
    <p class="font-bold text-center mb-10 mx-3">{{ props.question.question }}</p>
    <div v-if="props.question.type == 'select'" class="w-full">
      <ButtonComponent v-for="option in props.question.options" :text="option" class="mt-3 mx-auto" style="width: 80%"
        template="primary" @click="onSelected(option)" />
    </div>
    <div v-else class="w-2/3">
      <InputComponent ref="inputRef" v-model="answer" :type="props.question.type" @keydown.enter.prevent="goNext"
        @input="handleInput" />
    </div>
  </div>
</template>

<style scoped></style>