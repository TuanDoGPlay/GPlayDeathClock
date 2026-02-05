<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import ContentFrame from "@/screens/home/components/ContentFrame.vue";
import {ref} from "vue";
import Question1 from "@/screens/home/question/components/Question1.vue";
import MoreQuestion from "@/screens/home/question/components/MoreQuestion.vue";
import Question4 from "@/screens/home/question/components/Question4.vue";
import Question3 from "@/screens/home/question/components/Question3.vue";
import Question2 from "@/screens/home/question/components/Question2.vue";

const currentIndex = ref(4)

function handleBack() {
  currentIndex.value--
  if (currentIndex.value < 0) currentIndex.value = 0
}
</script>

<template>
  <ContentFrame :current-tab="currentIndex" :icon="Question" :total-tab="5" show-back show-pagination
                show-pagination-in-title
                title="Questions" @back="handleBack">
    <Question1 v-if="currentIndex == 0"/>
    <question2 v-if="currentIndex == 1"/>
    <question3 v-if="currentIndex == 2"/>
    <question4 v-if="currentIndex == 3"/>
    <MoreQuestion v-if="currentIndex == 4"/>
  </ContentFrame>
</template>

<style scoped>

</style>