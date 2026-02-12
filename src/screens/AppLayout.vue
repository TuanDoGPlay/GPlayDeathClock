<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import Share from '@/assets/icons/share.svg'
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import {onBeforeUnmount, onMounted, ref} from "vue";
import {EventEnum} from "@/constants/events.ts";
import {goToRouter} from "gplay-app-sdk";
import FirstTimeScreen from "@/screens/FirstTimeScreen.vue";
import {Preferences} from "@capacitor/preferences";


const isShowClock = ref(true)
const isFirstTime = ref(false)

const years = 85;
const msInYear = 365.25 * 24 * 60 * 60 * 1000;
const duration85Years = years * msInYear;
const time = ref(duration85Years);
let timer: number | undefined;

onMounted(async () => {

  document.addEventListener(EventEnum.ToggleClock, (e) => {
    const event = e as CustomEvent<{ isShow: boolean }>
    isShowClock.value = event.detail.isShow
  })
  document.addEventListener(EventEnum.ChangeTime, (e) => {
    const event = e as CustomEvent<{ time: number }>
    time.value += event.detail.time
  })

  Preferences.get({key: 'visited'}).then(({value}) => {
    // isFirstTime.value = value != 'true';
    // if (isFirstTime.value) goToRouter({name: 'question'})
  })
  timer = window.setInterval(() => {
    time.value += 1000;
  }, 1000);

  setTimeout(() => {
    isFirstTime.value = false
  }, 2000)
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

async function goToQuestion() {
  await goToRouter({name: 'question'})
}

async function goToShareClock() {
  await goToRouter({name: 'share-clock'})
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full px-2 pt-10 relative">

    <div
        :class="[
    isShowClock ? 'max-h-[50vh]' : 'max-h-0',
        isFirstTime ? 'mt-60' : ''

  ]"
        class="w-full overflow-hidden transition-all duration-1000 "
        style="z-index: 100"
    >
      <div class="flex flex-col items-center">
        <FlipClock :show-label="!isFirstTime" :value="time"/>
        <div
            :class="{ 'opacity-0 pointer-events-none': isFirstTime, 'opacity-100': !isFirstTime }"
            class="flex w-full justify-around my-5 transition-opacity  duration-[3000]"
        >
          <ButtonComponent :icon="Question" :text="'Questions'" @click="goToQuestion"/>
          <ButtonComponent :icon="Share" :text="'Share Clock'" @click="goToShareClock"/>
        </div>
      </div>
    </div>

    <FirstTimeScreen :class="{ 'opacity-0 pointer-events-none': !isFirstTime, 'opacity-100': isFirstTime }"
                     class="absolute top-0 left-0 w-full h-full z-10 transition-opacity duration-[3000]"/>

    <div :class="{ 'opacity-0 pointer-events-none': isFirstTime, 'opacity-100': !isFirstTime }"
         class="w-full flex-1 rounded-2xl overflow-hidden transition-opacity duration-[3000]"
         style="background-color: var(--panel-theme-1)">

      <RouterView v-slot="{ Component }">
        <Transition mode="out-in" name="fade">
          <component :is="Component" class="h-full w-full"/>
        </Transition>
      </RouterView>

    </div>
  </div>
</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>