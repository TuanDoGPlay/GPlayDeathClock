<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import { computed, onBeforeMount, ref, watch } from "vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import { goToRouter } from "gplay-app-sdk";
import QuestionItem from "@/screens/question/components/QuestionItem.vue";
import MoreQuestion from "@/screens/question/components/MoreQuestion.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";
import type { QuestionInstance } from "@/common/types.ts";
import { CommonController } from "@/common/controller.ts";
import DefaultQuestions from "@/screens/question/components/DefaultQuestions.vue";
import { Utils } from '@/common/utils';
import { EventEnum } from '@/constants/events';

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

  await fetchQuestions();
})

watch(activeName, async (newVal, oldVal) => {
  // oldVal là tab vừa rời đi
  // bỏ qua lần set initial hoặc oldVal rỗng
  if (!oldVal) return;

  // nếu rời khỏi tab câu hỏi (không phải tab "more")
  if (oldVal !== "more") {
    const question = questions.value.find(q => q.id.toString() === oldVal);
    const answer = answers.value[oldVal];

    if (question && answer != null) {
      await answerQuestion(question, answer);
    }
  }
});
async function fetchQuestions() {
  questions.value = await CommonController.getQuestions();
  activeName.value = questions.value[0]?.id.toString() || ""
}

function handleBack() {
  goToRouter({ name: 'home' })
}

async function answerQuestion(question: QuestionInstance, answer: any) {
  const incrementTime = Utils.calculateQuestionIncrementTime(question, answer);
  console.log(incrementTime);

  await CommonController.editRemainLiveTime(incrementTime);
  await CommonController.answerQuestion(question);
  document.dispatchEvent(new Event(EventEnum.ChangeTime))

}

function goNext(currentId: string) {
  const idx = questions.value.findIndex(q => q.id.toString() === currentId)
  const next = questions.value[idx + 1]?.id.toString() ?? "more"
  activeName.value = next
}
</script>

<template>
  <div class="h-full">
    <DefaultQuestions v-if="isFirstVisit" />

    <ContentFrame v-else :current-tab="currentTabIndex" :icon="Question" :total-tab="questions.length + 1" show-back
      show-pagination-in-title title="Questions" @back="handleBack">
      <TabComponent v-if="questions.length" v-model="activeName" :dots="true" :swipe="true">

        <TabPane v-for="question in questions" :key="question.id" :name="question.id.toString()">
          <QuestionItem :question="question" :focus="activeName == question.id.toString()"
            @input="val => { answers[question.id.toString()] = val; }" @next="val => {
              const id = question.id.toString()
              answers[id] = val
              goNext(id)
            }" />
        </TabPane>

        <TabPane label="More" name="more">
          <MoreQuestion />
        </TabPane>

      </TabComponent>
    </ContentFrame>
  </div>
</template>