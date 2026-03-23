<script lang="ts" setup>
import { nextTick, onMounted, ref } from "vue";
import gsap from "gsap";
import Question from '@/assets/icons/question.svg'
import Share from '@/assets/icons/share.svg'
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import { EventEnum } from "@/constants/events.ts";
import { CommonController } from "@/common/controller";
import { goToRouter } from "gplay-app-sdk";
import { App } from '@capacitor/app';

const splashWrapper = ref<HTMLElement | null>(null);
const clockWrapper = ref<HTMLElement | null>(null);
const textWrapper = ref<HTMLElement | null>(null);

const isShowClock = ref(true);
const isFirstVisit = ref(true);
const isClockSpin = ref(false);
const isPlaySound = ref(false);
const lines = Array.from({ length: 20 });

onMounted(async () => {
  await nextTick();
  await fetchIsFirstVisit();
  await CommonController.checkAndRunNewDayTask()

  App.addListener('appStateChange', ({ isActive }) => {
    console.log('isActive', isActive);
    isPlaySound.value = isActive
  });

  document.addEventListener(EventEnum.ToggleClock, (e) => {
    const event = e as CustomEvent<{ isShow: boolean }>;
    isShowClock.value = event.detail.isShow;
  });
});


async function fetchIsFirstVisit() {
  isFirstVisit.value = await CommonController.getIsFirstVisit();
  playMasterAnimation(); // ✅ Gọi 1 hàm duy nhất để xử lý toàn bộ GSAP
}

function playMasterAnimation() {
  const tl = gsap.timeline();

  // 1. Tắt Splash Screen chung 1 timeline
  if (splashWrapper.value) {
    tl.to(splashWrapper.value, {
      opacity: 0,
      scale: 1,
      filter: "blur(5px)",
      duration: 1,
      delay: 2,
      ease: "power2.inOut",
    });
  }

  // 2. Chạy tiếp hiệu ứng cho Clock và Text nếu là lần đầu
  if (isFirstVisit.value) {
    if (!clockWrapper.value || !textWrapper.value) return;

    const clockH = clockWrapper.value.getBoundingClientRect().height ?? 0;

    gsap.set(clockWrapper.value, { opacity: 0 });
    gsap.set(textWrapper.value, { opacity: 0, y: clockH / 2 + 100 });

    tl.to(clockWrapper.value, {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
    }, "-=0.2")
      .to(textWrapper.value, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        onStart: () => {
          isPlaySound.value = true
        }
      }, "+=0")
      // Chờ 3s để User đọc chữ rồi chuyển màn
      .add(() => {
        setTimeout(() => {
          isFirstVisit.value = false;
          goToQuestion();
        }, 3000);
      });
  }
}

async function goToQuestion() {
  await goToRouter({ name: 'question' });
}

async function goToShareClock() {
  await goToRouter({ name: 'share-clock' });
}
</script>

<template>
  <div class="main-container flex flex-col items-center justify-center h-full px-2 pt-10 pb-1 relative overflow-hidden"
    style="user-select: none;">
    <Teleport to="body">
      <img ref="splashWrapper" alt="splash" src="/splash.svg"
        class="fixed inset-0 z-[200] w-screen h-screen object-cover object-center pointer-events-none">
    </Teleport>

    <div :class="[
      isShowClock ? 'max-h-[50vh]' : 'max-h-0',
      isFirstVisit ? 'mt-60' : ''
    ]" class="w-full overflow-hidden z-[100]" style="transition: all 1s ease">
      <div class="flex flex-col items-center w-full">

        <div ref="clockWrapper" :class="{ 'opacity-0': isFirstVisit, 'opacity-100': !isFirstVisit }"
          class="transition-opacity w-full">
          <FlipClock :show-label="!isFirstVisit" :spin="isClockSpin" :play-sound="isPlaySound" class="w-full" />
        </div>

        <div :class="{ 'opacity-0 pointer-events-none': isFirstVisit, 'opacity-100': !isFirstVisit }"
          class="grid grid-cols-2 gap-1.5 w-full my-5" style="transition: opacity 0.5s ease">
          <ButtonComponent :icon="Question" :text="'Questions'" @click="goToQuestion" style="width: 100%;" />
          <ButtonComponent :icon="Share" :text="'Share Clock'" @click="goToShareClock" style="width: 100%;" />
        </div>
      </div>
    </div>

    <Transition name="fade-out">
      <div v-if="isFirstVisit" class="road-wrapper fixed inset-0 z-50 overflow-hidden bg-black">
        <img alt="way" class="h-full w-full object-cover" src="/way.svg">
        <div class="white-line left-2"></div>
        <div class="white-line right-2"></div>

        <div class="absolute inset-0 flex flex-col items-center road-animation">
          <div v-for="(_, index) in lines" :key="index" class="lane-line"></div>
        </div>

        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div ref="textWrapper" class="text-center px-10 opacity-0 mt-32">
            <h2 class="road-text">
              How much time<br>do you have left?
            </h2>
          </div>
        </div>
      </div>
    </Transition>

    <div :class="{ 'opacity-0 pointer-events-none': isFirstVisit, 'opacity-100': !isFirstVisit }"
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
.fade-out-leave-active {
  transition: opacity 1s ease;
}

.fade-out-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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