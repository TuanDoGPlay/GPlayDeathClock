<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import {computed, ref} from "vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import {goToRouter} from "gplay-app-sdk";
import QuestionItem from "@/screens/question/components/QuestionItem.vue";
import questions from "@/assets/data/questions.json";
import MoreQuestion from "@/screens/question/components/MoreQuestion.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";

const activeTabName = ref(questions[0]?.id.toString() || "more")

const currentTabIndex = computed(() => {
  const idx = questions.findIndex(q => q.id.toString() === activeTabName.value);
  return idx === -1 ? questions.length : idx; // Nếu là "more" thì trả về index cuối
})

function handleBack() {
  goToRouter({name: 'home'})
}
</script>

<template>
  <ContentFrame
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
        <QuestionItem :question="item"/>
      </TabPane>

      <TabPane label="More" name="more">
        <MoreQuestion/>
      </TabPane>
    </TabComponent>
  </ContentFrame>
</template>