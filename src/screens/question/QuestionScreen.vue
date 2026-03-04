<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import { computed, onBeforeMount, ref } from "vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import { goToRouter } from "gplay-app-sdk";
import QuestionItem from "@/screens/question/components/QuestionItem.vue";
import MoreQuestion from "@/screens/question/components/MoreQuestion.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";
import type { QuestionInstance } from "@/common/types.ts";
import { CommonController } from "@/common/controller.ts";
import DefaultQuestions from "@/screens/question/components/DefaultQuestions.vue";

const questions = ref<QuestionInstance[]>([])

const isFirstVisit = ref(false)


onBeforeMount(async () => {
  isFirstVisit.value = await CommonController.getIsFirstVisit();
})

function handleBack() {
  goToRouter({ name: 'home' })
}

</script>

<template>
  <div class="h-full">
    <DefaultQuestions v-if="isFirstVisit" />

    <ContentFrame v-else :icon="Question" show-back title="Questions" @back="handleBack">
    </ContentFrame>
  </div>
</template>