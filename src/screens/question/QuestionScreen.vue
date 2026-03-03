<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import {computed, ref} from "vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import {goToRouter} from "gplay-app-sdk";
import QuestionItem from "@/screens/question/components/QuestionItem.vue";
import questions from "@/assets/data/required-questions.json";
import MoreQuestion from "@/screens/question/components/MoreQuestion.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";
import type {UserData} from "@/common/types.ts";
import {CommonController} from "@/common/controller.ts";
import DefaultQuestions from "@/screens/question/components/DefaultQuestions.vue";

const userData = ref<UserData>({
  name: '',
  dob: '',
  sex: '',
  height: 0,
  weight: 0,
  sexualOrientation: '',
  remainTime: 0
})

const isFirstTime = ref(true)
const activeTabName = ref(questions[0]?.id.toString() || "more")

const currentTabIndex = computed(() => {
  const idx = questions.findIndex(q => q.id.toString() === activeTabName.value);
  return idx === -1 ? questions.length : idx;
})

function handleBack() {
  goToRouter({name: 'home'})
}

function changeQuestion(args: Record<string, any>) {
  userData.value = {...userData.value, ...args}
  if (currentTabIndex.value === questions.length) activeTabName.value = 'more'
  else activeTabName.value = (currentTabIndex.value + 1).toString()
  CommonController.saveUserData(userData.value)
}
</script>

<template>
  <div class="h-full">
    <DefaultQuestions v-if="isFirstTime"/>
    <ContentFrame
        v-else
        :current-tab="currentTabIndex"
        :icon="Question"
        :total-tab="questions.length + 1"
        show-back
        show-pagination-in-title
        title="Questions"
        @back="handleBack"
    >
      <TabComponent v-model="activeTabName" :dots="true" :swipe="true">
        <TabPane v-for="item in questions" :key="item.id" :name="item.id.toString()" label="Question">
          <QuestionItem :question="item" @next="changeQuestion"/>
        </TabPane>

        <TabPane label="More" name="more">
          <MoreQuestion/>
        </TabPane>
      </TabComponent>
    </ContentFrame>
  </div>
</template>