<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import Next from '@/assets/icons/next.svg'
import { computed, ref } from 'vue'
import ContentFrame from '@/components/content-frame/ContentFrame.vue'
import { goToRouter, showToast } from 'gplay-app-sdk'
import questions from '@/assets/data/required-questions.json'
import MoreQuestion from '@/screens/question/components/MoreQuestion.vue'
import InputComponent from '@/components/input/InputComponent.vue'
import ButtonComponent from '@/components/button/ButtonComponent.vue'
import type { UserData } from '@/common/types.ts'
import { MS_IN_MONTH, MS_IN_YEAR, Utils } from '@/common/utils'
import { CommonController } from '@/common/controller'
import { DatePicker } from '@capacitor-community/date-picker';
import SliderCarouselComponent from '@/components/carousel/SliderCarouselComponent.vue'

interface UserDataView {
  name: string
  dob: string
  sex: string
  height: number
  weight: number
  sexualOrientation: string
  remainTime?: number
}

const emit = defineEmits<{
  (e: 'more'): void
}>()

const userData = ref<UserDataView>({
  name: '',
  dob: '',
  sex: '',
  height: 160,
  weight: 50,
  sexualOrientation: '',
  remainTime: undefined,
})

const activeName = ref('0')

const inputRefName = ref<any>(null)
const inputRefDob = ref<any>(null)
const inputRefHeight = ref<any>(null)
const inputRefWeight = ref<any>(null)

const currentTabIndex = computed(() => {
  const stepMap: Record<string, number> = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    more: 6,
  }

  return stepMap[activeName.value] ?? 0
})

function handleBack() {
  goToRouter({ name: 'home' })
}

async function saveUserData() {
  const data: UserData = {
    name: userData.value.name.trim(),
    dob: userData.value.dob,
    height: Number(userData.value.height) || 0,
    weight: Number(userData.value.weight) || 0,
    sex: userData.value.sex,
    sexualOrientation: userData.value.sexualOrientation,
  }

  await CommonController.saveUserData(data)
}

async function goNextName() {
  if (!userData.value.name.trim()) {
    await showToast({ text: 'Please enter your name' })
    return
  }

  activeName.value = '1'
}

async function goNextDob() {
  // if (!userData.value.dob) {
  //   await showToast({ text: 'Please enter your date of birth' })
  //   return
  // }
  const [day, month, year] = userData.value.dob.split('/');

  const dobDate = new Date(Number(year), Number(month) - 1, Number(day));
  const now = new Date()

  if (Number.isNaN(dobDate.getTime())) {
    await showToast({ text: 'Invalid date of birth' })
    return
  }

  if (dobDate > now) {
    await showToast({ text: 'Date of birth cannot be in the future' })
    return
  }

  const yourAge = now.getFullYear() - dobDate.getFullYear()
  const startDate = new Date('2000-01-01T00:00:00')
  const futureDate = new Date(startDate)
  futureDate.setFullYear(startDate.getFullYear() + 85 - yourAge)
  console.log(futureDate.getTime())
  await CommonController.editRemainLiveTime(futureDate.getTime(), false)

  activeName.value = '2'
}

async function goNextHeight() {
  const height = Number(userData.value.height)

  if (!height) {
    await showToast({ text: 'Please enter your height' })
    return
  }

  userData.value.height = height

  const randomYear = Math.random() * 4 - 2
  let randomTime = randomYear * MS_IN_YEAR

  if (height <= 155) {
    randomTime -= (155 - height) * MS_IN_MONTH
  } else if (height >= 180) {
    randomTime -= (height - 180) * MS_IN_MONTH
  }

  await CommonController.editRemainLiveTime(randomTime)

  activeName.value = '3'
}

async function goNextWeight() {
  const weight = Number(userData.value.weight)
  const height = Number(userData.value.height)

  if (!weight) {
    await showToast({ text: 'Please enter your weight' })
    return
  }

  if (!height) {
    await showToast({ text: 'Missing height' })
    return
  }

  userData.value.weight = weight

  const bmi = Utils.calculateBMI(weight, height)
  let deductedYears = 0

  if (bmi < 16) deductedYears = 8
  else if (bmi < 17) deductedYears = 4
  else if (bmi < 18.5) deductedYears = 2
  else if (bmi < 25) deductedYears = 0
  else if (bmi < 30) deductedYears = 2
  else if (bmi < 35) deductedYears = 4
  else if (bmi < 40) deductedYears = 8
  else deductedYears = 15

  await CommonController.editRemainLiveTime(-deductedYears * MS_IN_YEAR)

  activeName.value = '4'
}

async function onSelected(field: 'sex' | 'sexualOrientation', option: string) {
  userData.value[field] = option
  await saveUserData()

  const randomYear = Math.random() * 4 - 2
  const randomTime = randomYear * MS_IN_YEAR

  await CommonController.editRemainLiveTime(randomTime)

  activeName.value = field === 'sex' ? '5' : 'more'

  if (field === 'sexualOrientation') {
    showToast({
      text: 'Thank you for sharing! Your data will be kept confidential.',
    })
  }
}

async function openDatePicker() {
  const { value } = await DatePicker.present({
    mode: 'date',
    format: 'dd/MM/yyyy',
  })
  if (value) {
    userData.value.dob = value
  }
}
</script>

<template>
  <div class="h-full overflow-hidden">
    <ContentFrame :current-tab="currentTabIndex" :icon="Question" :total-tab="questions.length + 1" show-back
      show-pagination-in-title title="Questions" @back="handleBack">
      <div class="relative h-full w-full overflow-hidden">
        <Transition mode="out-in" name="question-slide">
          <div :key="activeName" class="step-section">
            <template v-if="activeName === '0'">
              <p class="mb-10 text-center font-bold">What is your name?</p>
              <div class="mb-4 w-2/3">
                <InputComponent ref="inputRefName" v-model="userData.name" @keydown.enter.prevent="goNextName" />
              </div>
              <ButtonComponent :icon="Next" icon-right template="primary" text="Next" @click="goNextName" />
            </template>

            <template v-else-if="activeName === '1'">
              <p class="mb-10 text-center font-bold">Enter your date of birth</p>
              <div class="mb-4 w-2/3" @click="openDatePicker">
                <InputComponent ref="inputRefDob" readonly v-model="userData.dob" @keydown.enter.prevent="goNextDob" />
              </div>
              <ButtonComponent :icon="Next" icon-right template="primary" text="Next" @click="goNextDob" />
            </template>

            <template v-else-if="activeName === '2'">
              <p class="mb-10 text-center font-bold">Enter your height (cm)</p>
              <div class="mb-4 w-2/3">
                <SliderCarouselComponent ref="inputRefHeight" v-model="userData.height" :min="120" :max="200"
                  :step="1" />
              </div>
              <ButtonComponent :icon="Next" icon-right template="primary" text="Next" @click="goNextHeight" />
            </template>

            <template v-else-if="activeName === '3'">
              <p class="mb-10 text-center font-bold">Enter your current weight (kg)</p>
              <div class="mb-4 w-2/3">
                <SliderCarouselComponent ref="inputRefWeight" v-model="userData.weight" :min="40" :max="200"
                  :step="1" />
              </div>
              <ButtonComponent :icon="Next" icon-right template="primary" text="Next" @click="goNextWeight" />
            </template>

            <template v-else-if="activeName === '4'">
              <p class="mb-10 text-center font-bold">What is your biological sex?</p>
              <div class="flex w-full flex-col items-center">
                <ButtonComponent v-for="option in ['Male', 'Female', 'Other']" :key="option" :text="option" class="mt-3"
                  style="width: 80%" template="primary" @click="onSelected('sex', option)" />
              </div>
            </template>

            <template v-else-if="activeName === '5'">
              <p class="mb-10 text-center font-bold">What is your sexual orientation?</p>
              <div class="flex w-full flex-col items-center">
                <ButtonComponent v-for="option in ['Straight', 'Homosexual', 'Bisexual', 'Other']" :key="option"
                  :text="option" class="mt-3" style="width: 80%" template="primary"
                  @click="onSelected('sexualOrientation', option)" />
              </div>
            </template>

            <template v-else-if="activeName === 'more'">
              <MoreQuestion @more="emit('more')" />
            </template>
          </div>
        </Transition>
      </div>
    </ContentFrame>
  </div>
</template>
<style scoped>
.step-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 2.5rem;
}

/* slide */
.question-slide-enter-active,
.question-slide-leave-active {
  transition: transform 0.2s ease;
}

.question-slide-enter-from {
  transform: translateX(100%);
}

.question-slide-enter-to {
  transform: translateX(0);
}

.question-slide-leave-from {
  transform: translateX(0);
}

.question-slide-leave-to {
  transform: translateX(-100%);
}
</style>