<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import { computed, nextTick, onBeforeMount, ref, watch } from "vue";
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
const answers = ref<Record<string, any>>({}) // key: questionId (string)

const isFirstVisit = ref(false)
const activeName = ref("")

const currentTabIndex = computed(() => {
  const idx = questions.value.findIndex(q => q.id.toString() === activeName.value);
  return idx === -1 ? questions.value.length : idx;
})

onBeforeMount(async () => {
  isFirstVisit.value = await CommonController.getIsFirstVisit();
  console.log("first visit:", isFirstVisit.value);
})

watch(activeName, async (_newVal, oldVal) => {
  // oldVal là tab vừa rời đi
  // bỏ qua lần set initial hoặc oldVal rỗng
  if (!oldVal) return;
  // nếu rời khỏi tab câu hỏi (không phải tab "more")
  if (oldVal !== "more") {
    const question = questions.value.find(q => q.id.toString() === oldVal);
    const answer = answers.value[oldVal];

    if (question && answer) {
      await answerQuestion(question, answer);
    }
  }
});

async function fetchQuestions() {
  questions.value = await CommonController.getQuestions();
  await nextTick();
  activeName.value = questions.value[0]?.id.toString() || ""
}

function handleBack() {
  goToRouter({ name: 'home' })
}

async function answerQuestion(question: QuestionInstance, answer: any) {
  await CommonController.answerQuestion(question, answer);
}

function goNext(currentId: string) {
  const idx = questions.value.findIndex(q => q.id.toString() === currentId)
  activeName.value = questions.value[idx + 1]?.id.toString() ?? "more"
}

function moreQuestions() {
  isFirstVisit.value = false
  fetchQuestions()
}
</script>

<template>
  <div class="h-full">
    <DefaultQuestions v-if="isFirstVisit" @more="moreQuestions" />

    <ContentFrame v-else :current-tab="currentTabIndex" :icon="Question" :total-tab="questions.length + 1" show-back
      show-pagination-in-title title="Questions" @back="handleBack">
      <TabComponent v-model="activeName" :dots="true" :swipe="true">

        <TabPane v-for="question in questions" :key="question.id" :name="question.id.toString()">
          <QuestionItem :question="question" @input="val => { answers[question.id.toString()] = val; }" @next="val => {
            const id = question.id.toString()
            answers[id] = val
            goNext(id)
          }" />
        </TabPane>

        <TabPane label="More" name="more">
          <MoreQuestion @more="fetchQuestions" />
        </TabPane>

      </TabComponent>
    </ContentFrame>
  </div>
</template>