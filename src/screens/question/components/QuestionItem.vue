<script lang="ts" setup>

import ButtonComponent from "@/components/button/ButtonComponent.vue";
import {QuestionTypeEnum} from "@/constants/questionType.ts";
import type {QuestionType} from "@/common/types.ts";

const emit = defineEmits(['next'])

const props = defineProps<{
  question: QuestionType
}>()

</script>

<template>
  <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
    <p class="font-bold text-center mb-10">{{ props.question.question }}</p>
    <div v-if="props.question.type == QuestionTypeEnum.Input">
      input
    </div>
    <div v-else>
      <ButtonComponent v-for="option in props.question.options" :text="option" class="mt-3" style="width: 80%"
                       template="primary"
                       @click="emit('next')"/>
    </div>
  </div>
</template>

<style scoped>

</style>