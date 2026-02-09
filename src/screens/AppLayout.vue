<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import Share from '@/assets/icons/share.svg'
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import {onBeforeUnmount, onMounted, ref} from "vue";
import {EventEnum} from "@/constants/events.ts";
import {goToRouter} from "gplay-app-sdk";


const isShowClock = ref(true)

const now = ref(new Date().getTime());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date().getTime();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

document.addEventListener(EventEnum.ToggleClock, (e) => {
  const event = e as CustomEvent<{ isShow: boolean }>
  isShowClock.value = event.detail.isShow
})

async function goToQuestion() {
  await goToRouter({name: 'question'})
}

async function goToShareClock() {
  await goToRouter({name: 'share-clock'})
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full mx-2" style="padding-top: 2.5rem">
    <FlipClock v-if="isShowClock" :value="now"/>
    <div v-if="isShowClock" class="flex w-full justify-around my-5">
      <ButtonComponent :icon="Question" :text="'Questions'" @click="goToQuestion"/>
      <ButtonComponent :icon="Share" :text="'Share Clock'" @click="goToShareClock"/>
    </div>
    <RouterView class="w-full flex-1 rounded-2xl" style="background-color: var(--panel-theme-1)"/>
  </div>
</template>

<style scoped>
</style>