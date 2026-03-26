<script lang="ts" setup>
import Story from '@/assets/icons/story.svg';
import ShareIcon from '@/assets/icons/share.svg'; // Đổi tên để tránh trùng với plugin Share
import Video from '@/assets/icons/video.svg';
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import { computed, onMounted, ref } from "vue";
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import { Utils } from "@/common/utils.ts";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import { CommonController } from '@/common/controller';
import gsap from 'gsap';
import { QuestionInstance } from '@/common/types';
import { captureImage, loadRewardedVideo, showRewardedVideo } from '@gplay/app-sdk';
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from '@capacitor/share';

const emit = defineEmits(['back']);

const username = ref('You');
const originTime = ref(new Date().getTime());
const displayTime = ref(originTime.value);

const currentIndex = ref(0);
const isFirstVisit = ref(true);

const gunRef = ref<HTMLElement | null>(null);
const bulletRef = ref<HTMLElement | null>(null);
const manSurpriseRef = ref<HTMLElement | null>(null);
const manPainRef = ref<HTMLElement | null>(null);

const gunshotAudio = new Audio('/sounds/gunshot.mp3');

// Trạng thái Loading & Progress
const isSharing = ref(false);
const progress = ref(0);
const progressText = ref('Initializing...');

const questions = ref<QuestionInstance[]>([]);

const currentItem = computed(() => questions.value[currentIndex.value]);

onMounted(async () => {
  questions.value = await CommonController.getTopTimeDeductionQuestions();
  const data = await CommonController.getUserData();

  CommonController.getRemainLiveTime().then((data) => {
    let res = data;
    questions.value.map((i) => {
      res -= i.time;
    });
    originTime.value = res;
    displayTime.value = originTime.value;
  });
  username.value = data.name ?? 'You';

  loadRewardedVideo();
});

function handleBack() {
  emit('back');
}

function next() {
  if (currentIndex.value == 0 && isFirstVisit.value) {
    isFirstVisit.value = false;
  } else if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  } else currentIndex.value = 0;
  changeDisplayTime();
}

function goTo(index: number) {
  currentIndex.value = index;
  changeDisplayTime();
}

function changeDisplayTime() {
  const timeConsumed = questions.value
    .slice(0, currentIndex.value + 1)
    .reduce((acc, item) => acc - (item.time ?? 0), 0);

  displayTime.value = originTime.value - timeConsumed;
  playShootAnimation();
}

function playShootAnimation() {
  // 1. Nếu người chơi "trong sạch" (không bị trừ thời gian), bỏ qua hiệu ứng bắn
  if (questions.value.length === 0) return;

  // 2. Đảm bảo các DOM elements đã sẵn sàng
  if (!gunRef.value || !bulletRef.value || !manSurpriseRef.value || !manPainRef.value) return;

  // 3. Phát tiếng súng (Reset về 0 để hỗ trợ việc click bắn liên thanh)
  gunshotAudio.currentTime = 0;
  gunshotAudio.play().catch((e) => {
    // Catch lỗi Autoplay Policy của trình duyệt nếu người dùng chưa tương tác đủ
    console.warn('Audio play failed:', e);
  });

  // 4. Bắt đầu xử lý hoạt ảnh GSAP
  // Dừng mọi hoạt ảnh cũ nếu người dùng bấm quá nhanh
  gsap.killTweensOf([gunRef.value, bulletRef.value, manSurpriseRef.value, manPainRef.value]);

  const tl = gsap.timeline();

  // Trả tất cả các phần tử về trạng thái gốc trước khi bắn
  gsap.set(gunRef.value, { x: 0, y: 0, rotation: 0, yPercent: -50, transformOrigin: "80% 50%" });
  gsap.set(bulletRef.value, { x: 0, y: 0, opacity: 1, yPercent: -50 });
  gsap.set(manSurpriseRef.value, { opacity: 1, x: 0, y: 0, yPercent: -50 });
  gsap.set(manPainRef.value, { opacity: 0, x: 0, y: 0, yPercent: -50 });

  // Hoạt ảnh 1: Khẩu súng giật lùi và nảy lên
  tl.to(gunRef.value, {
    x: -15,
    rotation: -15,
    duration: 0.05,
    yoyo: true,
    opacity: 1,
    repeat: 1,
    ease: "power1.out"
  }, 0);

  // Hoạt ảnh 2: Viên đạn bay ngang màn hình
  tl.to(bulletRef.value, {
    x: "50vw", // Cự ly bay của đạn
    duration: 0.15,
    ease: "power2.in"
  }, 0)
    // Khi đạn chạm mục tiêu
    .to(bulletRef.value, { opacity: 0, duration: 0 })
    .to(manSurpriseRef.value, { opacity: 0, duration: 0 }, "<")
    .to(manPainRef.value, { opacity: 1, duration: 0 }, "<")

    // Hoạt ảnh 3: Người bị giật tung lên vì đau
    .to(manPainRef.value, {
      x: 4,
      y: -4,
      yoyo: true,
      repeat: 3,
      duration: 0.05
    });
}

async function shareImage() {
  if (isSharing.value) return;

  // 1. Kích hoạt trạng thái hiển thị ngay lập tức
  isSharing.value = true;
  progress.value = 5;
  progressText.value = 'Initializing...';

  // 2. Dùng setTimeout để "nhường" cho Vue vẽ cái Popup lên trước
  // Sau 50ms (khi popup đã hiện), mới bắt đầu các tác vụ nặng
  setTimeout(async () => {
    try {
      progress.value = 15;
      progressText.value = 'Capturing story...';

      // Tác vụ nặng 1: Chụp ảnh
      const base64Data = await captureImage({
        elementId: 'captureArea',
      });

      progress.value = 50;
      progressText.value = 'Processing image...';

      // Tác vụ nặng 2: Ghi file
      const fileName = `death-story-${Date.now()}.png`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      progress.value = 85;
      progressText.value = 'Preparing to share...';

      // Tác vụ nặng 3: Gọi Native Share
      await Share.share({
        files: [savedFile.uri],
      });

      progress.value = 100;
    } catch (e) {
      console.error('Failed to share story:', e);
      // Nếu lỗi thì đóng popup luôn
      isSharing.value = false;
    } finally {
      setTimeout(() => {
        isSharing.value = false;
        progress.value = 0;
      }, 500);
    }
  }, 50); // Delay 50ms cực kỳ quan trọng để UI kịp render
}

function handShareImage() {
  showRewardedVideo(() => {
    shareImage();
  });
}

function shareVideo() {
  alert('Coming soon!');
}
</script>

<template>
  <ContentFrame :icon="Story" hide-split-bar show-back title="Death Story" @back="handleBack">
    <div class="h-full w-full flex flex-col">
      <div id="captureArea" class="flex-1 relative rounded-lg overflow-hidden bg p-2" @click="next()">
        <div class="flex gap-1 w-full mb-4">
          <span v-for="(bar, index) in questions" :key="bar.id" :class="{ active: index === currentIndex }" class="bar"
            @click.stop="goTo(index)"></span>
        </div>

        <div>
          <FlipClock :animation-duration="1000" :hide-animation="isFirstVisit" :value="displayTime" :play-sound="false"
            style="width: 100%;" />
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
          <div class="text">
            <template v-if="questions.length > 0">
              <p>{{ currentItem?.label }} killed</p>
              <p v-if="currentItem" class="time">{{ Utils.formatShortenDuration(-(currentItem?.time ?? 0)) }}</p>
              <p>of our {{ username }}</p>
            </template>

            <template v-else>
              <p>Your timeline is pure.</p>
              <p class="time">No time deducted</p>
              <p>for our {{ username }}</p>
            </template>
          </div>
        </div>
      </div>

      <div class="flex justify-between mt-5" style="width: 99%;">
        <ButtonComponent :icon="ShareIcon" font-size="0.8rem" show-ad-tag template="primary" text="Share Now"
          @click="handShareImage" />
        <ButtonComponent :icon="Video" font-size="0.8rem" template="primary" text="Create Video" @click="shareVideo" />
      </div>
    </div>

    <Transition name="fade">
      <div v-if="isSharing" class="progress-overlay">
        <div class="progress-card">
          <div class="progress-header">
            <span>{{ progressText }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div :style="{ width: progress + '%' }" class="progress-bar-fill"></div>
          </div>
        </div>
      </div>
    </Transition>
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

/* Progress Popup Styles */
.progress-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.progress-card {
  background: #282828;
  /* Màu tối hợp tone background của Death Story */
  width: 100%;
  max-width: 300px;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid #575757;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: white;
  font-family: "Crimson Pro", serif;
  font-weight: bold;
  font-size: 0.9rem;
}

.progress-bar-bg {
  width: 100%;
  height: 10px;
  background: #444;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #DB3A3A;
  /* Màu đỏ nổi bật trên nền tối */
  transition: width 0.3s ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>