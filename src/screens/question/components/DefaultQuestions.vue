<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import {computed, ref} from "vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import {goToRouter} from "gplay-app-sdk"; // Thêm showToast để báo lỗi nếu cần
import questions from "@/assets/data/required-questions.json";
import MoreQuestion from "@/screens/question/components/MoreQuestion.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";
import InputComponent from "@/components/input/InputComponent.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";

const userData = ref({
  name: '',
  dob: '',
  sex: '',
  height: undefined,
  weight: undefined,
  sexualOrientation: '',
  remainTime: undefined
})
const activeName = ref(questions[0]?.id.toString() || "0")

const currentTabIndex = computed(() => {
  const idx = questions.findIndex(q => q.id.toString() === activeName.value);
  return idx === -1 ? questions.length : idx;
})

function handleBack() {
  goToRouter({name: 'home'})
}

// --- Tách các hàm goNext riêng biệt ---

function goNextName() {
  if (!userData.value.name.trim()) {
    // Tùy chọn: Validate không cho nhập rỗng
    // showToast({ text: "Please enter your name" });
    // return;
  }
  activeName.value = "1";
}

function goNextDob() {
  if (!userData.value.dob) return;
  activeName.value = "2";
}

function goNextHeight() {
  if (!userData.value.height) return;
  activeName.value = "3";
}

function goNextWeight() {
  if (!userData.value.weight) return;
  activeName.value = "4";
}

// Xử lý tự động next khi click vào các nút lựa chọn
function onSelected(field: 'sex' | 'sexualOrientation', option: string) {
  userData.value[field] = option;

  if (field === 'sex') {
    activeName.value = "5"; // Chuyển sang câu Orientation
  } else if (field === 'sexualOrientation') {
    activeName.value = "more"; // Chuyển sang tab MoreQuestion
  }
}
</script>

<template>
  <div class="h-full">
    <ContentFrame
        :current-tab="currentTabIndex"
        :icon="Question"
        :total-tab="questions.length + 1"
        show-back
        show-pagination-in-title
        title="Questions"
        @back="handleBack"
    >
      <TabComponent v-model="activeName" :dots="true" :swipe="true">
        <TabPane label="Name" name="0">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">What is your name?</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefName" v-model="userData.name" @keydown.enter.prevent="goNextName"/>
            </div>
          </div>
        </TabPane>

        <TabPane label="Date of Birth" name="1">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">Enter your date of birth</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefDob" v-model="userData.dob" type="date" @keydown.enter.prevent="goNextDob"/>
            </div>
          </div>
        </TabPane>

        <TabPane label="Height" name="2">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">Enter your height (cm)</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefHeight" v-model="userData.height" type="number"
                              @keydown.enter.prevent="goNextHeight"/>
            </div>
          </div>
        </TabPane>

        <TabPane label="Weight" name="3">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">Enter your current weight (kg)</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefWeight" v-model="userData.weight" type="number"
                              @keydown.enter.prevent="goNextWeight"/>
            </div>
          </div>
        </TabPane>

        <TabPane label="Biological Sex" name="4">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">What is your biological sex?</p>
            <div class="w-full">
              <ButtonComponent
                  v-for="option in ['Male', 'Female', 'Other']"
                  :key="option"
                  :text="option"
                  class="mt-3 mx-auto"
                  style="width: 80%"
                  template="primary"
                  @click="onSelected('sex', option)"/>
            </div>
          </div>
        </TabPane>

        <TabPane label="Sexual Orientation" name="5">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">What is your sexual orientation?</p>
            <div class="w-full">
              <ButtonComponent
                  v-for="option in ['Straight', 'Homosexual', 'Bisexual', 'Other']"
                  :key="option"
                  :text="option"
                  class="mt-3 mx-auto"
                  style="width: 80%"
                  template="primary"
                  @click="onSelected('sexualOrientation', option)"/>
            </div>
          </div>
        </TabPane>

        <TabPane label="More" name="more">
          <MoreQuestion/>
        </TabPane>

      </TabComponent>
    </ContentFrame>
  </div>
</template>