<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import { computed, onMounted, ref } from "vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import { goToRouter, showToast } from "gplay-app-sdk";
import questions from "@/assets/data/required-questions.json";
import MoreQuestion from "@/screens/question/components/MoreQuestion.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";
import InputComponent from "@/components/input/InputComponent.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import { EventEnum } from "@/constants/events.ts";
import type { UserData } from "@/common/types.ts";
import { MS_IN_MONTH, MS_IN_YEAR, Utils } from '@/common/utils';
import { CommonController } from '@/common/controller';

interface UserDataView {
  name: string
  dob: string
  sex: string
  height?: number
  weight?: number
  sexualOrientation: string
  remainTime?: number
}

const userData = ref<UserDataView>({
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

onMounted(async () => {
  await fetchUserData();
  if (userData.value.name) {
    activeName.value = "1";
  }
  if (userData.value.dob) {
    activeName.value = "2";
  }
  if (userData.value.height) {
    activeName.value = "3";
  }
  if (userData.value.weight) {
    activeName.value = "4";
  }
  if (userData.value && userData.value.sex) {
    activeName.value = "5";
  }
  if (userData.value && userData.value.sexualOrientation) {
    activeName.value = "more";
  }
})

function handleBack() {
  goToRouter({ name: 'home' })
}

async function fetchUserData() {
  const data = await CommonController.getUserData()
  if (data.name) userData.value.name = data.name;
  if (data.dob) userData.value.dob = data.dob;
  if (data.height) userData.value.height = data.height;
  if (data.weight) userData.value.weight = data.weight
  if (data.sex) userData.value.sex = data.sex
  if (data.sexualOrientation) userData.value.sexualOrientation = data.sexualOrientation
  if (data.remainTime) userData.value.remainTime = data.remainTime;
}

async function saveUserData() {
  const data: UserData = {
    name: userData.value.name,
    dob: userData.value.dob,
    height: userData.value.height || 0,
    weight: userData.value.weight || 0,
    remainTime: userData.value.remainTime || 0,
    sex: userData.value.sex,
    sexualOrientation: userData.value.sexualOrientation
  }
  await CommonController.saveUserData(data);
}

function goNextName() {
  if (!userData.value.name.trim()) {
    showToast({ text: "Please enter your name" });
    return;
  }
  saveUserData();

  activeName.value = "1";
}

function goNextDob() {
  console.log(userData.value);
  if (!userData.value.dob) return;
  saveUserData();

  const yourAge = new Date().getFullYear() - new Date(userData.value.dob).getFullYear();
  const startDate = new Date('2000-01-01T00:00:00');
  const futureDate = new Date(startDate);
  futureDate.setFullYear(startDate.getFullYear() + 85 - yourAge);
  CommonController.editRemainLiveTime(futureDate.getTime(), false).then(() => {
    document.dispatchEvent(new Event(EventEnum.ChangeTime))
  })
  activeName.value = "2";
}

function goNextHeight() {
  console.log(userData.value);
  if (!userData.value.height) return;
  saveUserData();

  const randomYear = Math.random() * 4 - 2;
  let randomTime = randomYear * MS_IN_YEAR; // Convert years to milliseconds
  const height = userData.value.height;
  if (height <= 155) {
    randomTime -= (155 - height) * MS_IN_MONTH
  } else if (height >= 180) {
    randomTime -= (height - 180) * MS_IN_MONTH
  }

  CommonController.editRemainLiveTime(randomTime).then(() => {
    document.dispatchEvent(new Event(EventEnum.ChangeTime))
  })
  activeName.value = "3";
}

function goNextWeight() {
  console.log(userData.value);
  if (!userData.value.weight || !userData.value.height) return;
  saveUserData();

  const bmi = Utils.calculateBMI(userData.value.weight, userData.value.height);
  let deductedYears = 0;
  if (bmi < 16) {
    // Gầy độ III
    deductedYears = 8;
  } else if (bmi >= 16 && bmi < 17) {
    // Gầy độ II
    deductedYears = 4;
  } else if (bmi >= 17 && bmi < 18.5) {
    // Gầy độ I
    deductedYears = 2;
  } else if (bmi >= 18.5 && bmi < 25) {
    // Bình thường
    deductedYears = 0;
  } else if (bmi >= 25 && bmi < 30) {
    // Thừa cân
    deductedYears = 2;
  } else if (bmi >= 30 && bmi < 35) {
    // Béo phì độ I
    deductedYears = 4;
  } else if (bmi >= 35 && bmi < 40) {
    // Béo phì độ II
    deductedYears = 8;
  } else if (bmi >= 40) {
    // Béo phì độ III
    deductedYears = 15;
  }

  CommonController.editRemainLiveTime(-deductedYears * MS_IN_YEAR).then(() => {
    document.dispatchEvent(new Event(EventEnum.ChangeTime))
  })
  activeName.value = "4";
}

// Xử lý tự động next khi click vào các nút lựa chọn
function onSelected(field: 'sex' | 'sexualOrientation', option: string) {
  userData.value[field] = option;
  saveUserData()

  const randomYear = Math.random() * 4 - 2;
  let randomTime = randomYear * MS_IN_YEAR; // Convert years to milliseconds
  CommonController.editRemainLiveTime(randomTime).then(() => {
    document.dispatchEvent(new Event(EventEnum.ChangeTime))
  })

  activeName.value = field === 'sex' ? "5" : "more";
  if (field === 'sexualOrientation') {
    showToast({ text: "Thank you for sharing! Your data will be kept confidential." });
  }
}
</script>

<template>
  <div class="h-full">
    <ContentFrame :current-tab="currentTabIndex" :icon="Question" :total-tab="questions.length + 1" show-back
      show-pagination-in-title title="Questions" @back="handleBack">
      <TabComponent v-model="activeName" :dots="true" :swipe="true">
        <TabPane label="Name" name="0">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">What is your name?</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefName" v-model="userData.name" @keydown.enter.prevent="goNextName" />
            </div>
          </div>
        </TabPane>

        <TabPane label="Date of Birth" name="1">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">Enter your date of birth</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefDob" v-model="userData.dob" type="date" @keydown.enter.prevent="goNextDob" />
            </div>
          </div>
        </TabPane>

        <TabPane label="Height" name="2">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">Enter your height (cm)</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefHeight" v-model="userData.height" type="number"
                @keydown.enter.prevent="goNextHeight" />
            </div>
          </div>
        </TabPane>

        <TabPane label="Weight" name="3">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">Enter your current weight (kg)</p>
            <div class="w-2/3">
              <InputComponent ref="inputRefWeight" v-model="userData.weight" type="number"
                @keydown.enter.prevent="goNextWeight" />
            </div>
          </div>
        </TabPane>

        <TabPane label="Biological Sex" name="4">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">What is your biological sex?</p>
            <div class="w-full">
              <ButtonComponent v-for="option in ['Male', 'Female', 'Other']" :key="option" :text="option"
                class="mt-3 mx-auto" style="width: 80%" template="primary" @click="onSelected('sex', option)" />
            </div>
          </div>
        </TabPane>

        <TabPane label="Sexual Orientation" name="5">
          <div class="flex flex-col gap-3 items-center justify-center h-full pb-10">
            <p class="font-bold text-center mb-10">What is your sexual orientation?</p>
            <div class="w-full">
              <ButtonComponent v-for="option in ['Straight', 'Homosexual', 'Bisexual', 'Other']" :key="option"
                :text="option" class="mt-3 mx-auto" style="width: 80%" template="primary"
                @click="onSelected('sexualOrientation', option)" />
            </div>
          </div>
        </TabPane>

        <TabPane label="More" name="more">
          <MoreQuestion />
        </TabPane>

      </TabComponent>
    </ContentFrame>
  </div>
</template>