<script lang="ts" setup>
import Story from '@/assets/icons/story.svg'
import Share from '@/assets/icons/share.svg'
import Video from '@/assets/icons/video.svg'
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import { computed, nextTick, ref } from "vue";
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import { Utils } from "@/common/utils.ts";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import { onMounted } from 'vue';
import { CommonController } from '@/common/controller';
import gsap from 'gsap';
import { QuestionInstance } from '@/common/types';

const emit = defineEmits(['back'])

const username = ref('You')
const originTime = ref(new Date().getTime())
const displayTime = ref(originTime.value)

const currentIndex = ref(0)
const isFirstVisit = ref(true)

const gunRef = ref<HTMLElement | null>(null)
const bulletRef = ref<HTMLElement | null>(null)
const manSurpriseRef = ref<HTMLElement | null>(null)
const manPainRef = ref<HTMLElement | null>(null)


const questions = ref<QuestionInstance[]>([
])

const currentItem = computed(() => questions.value[currentIndex.value])

onMounted(async () => {
  questions.value = await CommonController.getTopTimeDeductionQuestions()
  const data = await CommonController.getUserData()
  console.log('questions', questions.value);
  CommonController.getRemainLiveTime().then((data) => {
    let res = data
    questions.value.map((i) => {
      res -= i.time
    })
    originTime.value = res
    displayTime.value = originTime.value
  })
  username.value = data.name ?? 'You'
})

function handleBack() {
  emit('back')
}

function next() {
  if (currentIndex.value == 0 && isFirstVisit.value) {
    isFirstVisit.value = false
  } else if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  } else currentIndex.value = 0
  changeDisplayTime()
}

function goTo(index: number) {
  currentIndex.value = index
  changeDisplayTime()
}


function changeDisplayTime() {
  const timeConsumed = questions.value
    .slice(0, currentIndex.value + 1)
    .reduce((acc, item) => acc - (item.time ?? 0), 0);

  displayTime.value = originTime.value - timeConsumed;

  playShootAnimation();
}

function playShootAnimation() {
  if (!gunRef.value || !bulletRef.value || !manSurpriseRef.value || !manPainRef.value) return;

  gsap.killTweensOf([gunRef.value, bulletRef.value, manSurpriseRef.value, manPainRef.value]);

  const tl = gsap.timeline();

  // Reset trạng thái: THÊM LẠI yPercent: -50 cho súng để căn giữa chính xác
  gsap.set(gunRef.value, { x: 0, y: 0, rotation: 0, yPercent: -50, transformOrigin: "80% 50%" });
  gsap.set(bulletRef.value, { x: 0, y: 0, opacity: 1, yPercent: -50 });
  gsap.set(manSurpriseRef.value, { opacity: 1, x: 0, y: 0, yPercent: -50 });
  gsap.set(manPainRef.value, { opacity: 0, x: 0, y: 0, yPercent: -50 });

  // Súng giật lùi và hếch lên
  tl.to(gunRef.value, {
    x: -15,
    rotation: -15,
    duration: 0.05,
    yoyo: true,
    opacity: 1,
    repeat: 1,
    ease: "power1.out"
  }, 0);

  // Đạn bay
  tl.to(bulletRef.value, {
    x: "200px", // (tuỳ chỉnh khoảng cách này)
    duration: 0.15,
    ease: "power2.in"
  }, 0)
    .to(bulletRef.value, { opacity: 0, duration: 0 })
    .to(manSurpriseRef.value, { opacity: 0, duration: 0 }, "<")
    .to(manPainRef.value, { opacity: 1, duration: 0 }, "<")
    .to(manPainRef.value, {
      x: 4,
      y: -4,
      yoyo: true,
      repeat: 3,
      duration: 0.05
    });
}

function shareImage() {
  alert('Coming soon!')
}

function shareVideo() {
  alert('Coming soon!')
}
</script>

<template>
  <ContentFrame :icon="Story" hide-split-bar show-back title="Death Story" @back="handleBack">
    <div class="h-full w-full flex flex-col">
      <div class="flex-1 relative rounded-lg overflow-hidden bg p-2" @click="next()">
        <div class="flex gap-1 w-full mb-4">
          <span v-for="(bar, index) in questions" :key="bar.id" :class="{ active: index === currentIndex }" class="bar"
            @click.stop="goTo(index)"></span>
        </div>

        <div>
          <FlipClock :value="displayTime" :hide-animation="isFirstVisit" style="width: 100%;" />
        </div>

        <div class="relative" style="height: 35vh">
          <img ref="gunRef" alt="" class="absolute top-1/2 -translate-y-1/2 left-3 z-10"
            src="/templates/death-story/gun.png" style="height: 25%">

          <img ref="bulletRef" alt="" class="absolute top-1/2 -translate-y-1/2 left-20 z-0 opacity-0"
            src="/templates/death-story/bullet.png" style="height: 5%">

          <img ref="manSurpriseRef" alt="" class="absolute top-1/2 -translate-y-1/2 right-3 z-10"
            src="/templates/death-story/man_surprise.svg" style="height: 80%">

          <img ref="manPainRef" alt="" class="absolute top-1/2 -translate-y-1/2 right-3 z-10 opacity-0"
            src="/templates/death-story/man_pain.svg" style="height: 80%">
        </div>

        <div class="text">
          <p>{{ currentItem?.label }} killed</p>
          <p v-if="currentItem" class="time">{{ Utils.formatShortenDuration(-(currentItem?.time ?? 0)) }}</p>
          <p>of our {{ username }}</p>
        </div>
      </div>

      <div class="flex justify-between mt-5" style="width: 99%;">
        <ButtonComponent :icon="Share" font-size="0.8rem" show-ad-tag template="primary" text="Share Now"
          @click="shareImage" />
        <ButtonComponent :icon="Video" font-size="0.8rem" show-ad-tag template="primary" text="Create Video"
          @click="shareVideo" />
      </div>
    </div>
  </ContentFrame>
</template>

<style scoped>
.bg {
  background: linear-gradient(180deg, #282828 0%, #575757 31.73%, #4E4E4E 57.69%, #202020 100%);
}

.bar {
  background: white;
  opacity: 0.3;
  height: 0.2rem;
  flex: 1;
  transition: opacity 200ms ease;
  border-radius: 1rem;
}

.bar.active {
  opacity: 0.7;
}

.text {
  text-align: center;
  color: white;
  font-family: "Crimson Pro", serif;
  font-size: 1.5rem;
  line-height: 1;
}

.time {
  color: var(--color-red);
  font-weight: bold;
}
</style>
