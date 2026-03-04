<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { Preferences } from "@capacitor/preferences";
import { goToRouter } from "gplay-app-sdk";
import gsap from "gsap"; // Import GSAP
import Question from '@/assets/icons/question.svg'
import Share from '@/assets/icons/share.svg'
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import { EventEnum } from "@/constants/events.ts";
import type { ChangeClockData } from "@/common/types.ts";
import { CommonController } from "@/common/controller";

const clockWrapper = ref<HTMLElement | null>(null);
const textWrapper = ref<HTMLElement | null>(null);

const isShowClock = ref(true);
const isFirstTime = ref(true);

const startDate = new Date('2000-01-01T00:00:00');
const futureDate = new Date(startDate);
futureDate.setFullYear(startDate.getFullYear() + 85);
const time = ref(futureDate.getTime());

let timer: number | undefined;

const lines = Array.from({ length: 20 });

onMounted(async () => {
  await nextTick();


  const isFirstVisit = await CommonController.getIsFirstVisit();
  if (isFirstVisit) {
    animate();
    setTimeout(() => {
      isFirstTime.value = false;
      goToQuestion()
    }, 5000);
  } else {
    isFirstTime.value = false;

  }

  timer = window.setInterval(() => {
    time.value -= 1000;
  }, 1000);

  document.addEventListener(EventEnum.ToggleClock, (e) => {
    const event = e as CustomEvent<{ isShow: boolean }>;
    isShowClock.value = event.detail.isShow;
  });

  document.addEventListener(EventEnum.ChangeTime, (e) => {
    const event = e as CustomEvent<ChangeClockData>;
    console.log('event', event.detail)
    if (event.detail.increase) time.value += event.detail.increase;
    else if (event.detail.assign) time.value = event.detail.assign;
  });
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

function animate() {
  if (!clockWrapper.value || !textWrapper.value) return;

  const clockH = clockWrapper.value.getBoundingClientRect().height ?? 0;

  // Set trạng thái ban đầu
  gsap.set(clockWrapper.value, { opacity: 0 });
  gsap.set(textWrapper.value, {
    opacity: 0,
    y: clockH / 2 + 60, // spawn dưới clock
  });

  const tl = gsap.timeline();

  tl.to(clockWrapper.value, {
    opacity: 1,
    duration: 1,
    ease: "power2.inOut",
  }).to(
    textWrapper.value,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    },
    "+=0"
  );
}

async function goToQuestion() {
  await goToRouter({ name: 'question' });
}

async function goToShareClock() {
  await goToRouter({ name: 'share-clock' });
}
</script>

<template>
  <div class="main-container flex flex-col items-center justify-center h-full px-2 pt-10 relative overflow-hidden">

    <div :class="[
      isShowClock ? 'max-h-[50vh]' : 'max-h-0',
      isFirstTime ? 'mt-60' : ''
    ]" class="w-full overflow-hidden z-[100]" style="transition: all 1s ease">
      <div class="flex flex-col items-center">

        <div ref="clockWrapper" :class="{ 'opacity-0': isFirstTime, 'opacity-100': !isFirstTime }"
          class="transition-opacity">
          <FlipClock :show-label="!isFirstTime" :value="time" />
        </div>

        <div :class="{ 'opacity-0 pointer-events-none': isFirstTime, 'opacity-100': !isFirstTime }"
          class="flex w-full justify-around my-5" style="transition: opacity 0.5s ease">
          <ButtonComponent :icon="Question" :text="'Questions'" @click="goToQuestion" />
          <ButtonComponent :icon="Share" :text="'Share Clock'" @click="goToShareClock" />
        </div>
      </div>
    </div>

    <Transition name="fade-out">
      <div v-if="isFirstTime" class="road-wrapper fixed inset-0 z-50 overflow-hidden bg-black">
        <img alt="way" class="h-full w-full object-cover" src="/way.svg">
        <div class="white-line left-2"></div>
        <div class="white-line right-2"></div>

        <div class="absolute inset-0 flex flex-col items-center road-animation">
          <div v-for="(_, index) in lines" :key="index" class="lane-line"></div>
        </div>

        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div ref="textWrapper" class="text-center px-10 opacity-0 mt-20">
            <h2 class="road-text">
              How much time<br>do you have left?
            </h2>
          </div>
        </div>
      </div>
    </Transition>

    <div :class="{ 'opacity-0 pointer-events-none': isFirstTime, 'opacity-100': !isFirstTime }"
      class="w-full flex-1 rounded-2xl overflow-hidden"
      style="background-color: var(--panel-theme-1); transition: opacity 2s ease">
      <RouterView v-slot="{ Component }">
        <Transition mode="out-in" name="fade">
          <component :is="Component" class="h-full w-full" />
        </Transition>
      </RouterView>
    </div>

  </div>
</template>

<style scoped>
/* --- Hiệu ứng biến mất màn hình Road Screen --- */
.fade-out-leave-active {
  transition: opacity 1s ease;
}

.fade-out-leave-to {
  opacity: 0;
}

/* --- Router View Transition --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- Road Screen Styles --- */
.road-wrapper {
  height: 100vh;
  width: 100vw;
}

.road-animation {
  gap: 4rem;
  padding-top: 2rem;
  animation: scroll-down 1.2s linear infinite;
}

.lane-line {
  width: 1rem;
  height: 5rem;
  opacity: 0.4;
  background: #D8A721;
  border-radius: 0.2rem;
  flex-shrink: 0;
  box-shadow: 0 0 15px rgba(216, 167, 33, 0.4);
}

@keyframes scroll-down {
  0% {
    transform: translateY(-9rem);
  }

  100% {
    transform: translateY(0);
  }
}

.road-text {
  color: #E4E4E4;
  font-weight: 700;
  line-height: 1.2;
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.2rem;
}

.white-line {
  height: 100%;
  width: 0.75rem;
  background-color: var(--panel-theme-1);
  position: absolute;
  top: 0;
}
</style>