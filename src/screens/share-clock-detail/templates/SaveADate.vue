<script lang="ts" setup>
import Heart from '@/assets/icons/heart.svg'
import ShareIcon from '@/assets/icons/share.svg' // Đổi tên để tránh trùng với plugin Share
import {CommonController} from '@/common/controller';
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import {computed, onMounted, ref} from "vue";
import {captureImage, loadRewardedVideo, showRewardedVideo} from '@gplay/app-sdk';
import {Directory, Filesystem} from "@capacitor/filesystem";
import {Share} from '@capacitor/share';

const emit = defineEmits(['back'])

const deathTime = ref(new Date())
const username = ref('You')

// Trạng thái Loading & Progress
const isSharing = ref(false);
const progress = ref(0);
const progressText = ref('Initializing...');

const deathTimeDisplay = computed(() => {
  const formattedDate = deathTime.value.toLocaleDateString('en-GB')
  return formattedDate.replace(/\//g, '-');
})

onMounted(async () => {
  deathTime.value = await CommonController.getDeathMoment()
  const data = await CommonController.getUserData()
  username.value = data.name ?? 'You'
  loadRewardedVideo()
})

function handleBack() {
  emit('back')
}

function handleShare() {
  showRewardedVideo(() => {
    shareImage()
  })
}

async function shareImage() {
  if (isSharing.value) return;

  isSharing.value = true;
  progress.value = 10;
  progressText.value = 'Capturing your date...';

  try {
    // 1. Chụp vùng template (id="capture-area")
    const base64Data = await captureImage({
      elementId: 'capture-area',
    });

    progress.value = 40;
    progressText.value = 'Preparing image...';

    // 2. Lưu vào thư mục Cache
    const fileName = `save-a-date-${Date.now()}.png`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    progress.value = 80;
    progressText.value = 'Opening share menu...';

    // 3. Gọi trình chia sẻ của Android
    await Share.share({
      files: [savedFile.uri],
    });

    progress.value = 100;
  } catch (e) {
    console.error('Failed to share:', e);
  } finally {
    // Đợi 0.5s để hiện 100% cho đẹp rồi đóng
    setTimeout(() => {
      isSharing.value = false;
      progress.value = 0;
    }, 500);
  }
}
</script>

<template>
  <ContentFrame :icon="Heart" hide-split-bar show-back title="Save A Date" @back="handleBack">
    <div class="h-full w-full flex flex-col">
      <div id="capture-area" class="flex-1 relative rounded-lg overflow-hidden">
        <img alt="" class="absolute w-full h-full object-cover inset-0" src="/templates/save-a-date/bg.png">
        <img alt="" class="absolute  bottom-0 right-0" src="/templates/save-a-date/death.png" style="width: 65%">
        <img alt="" class="absolute bottom-0 left-0" src="/templates/save-a-date/flower.png" style="width: 30%">
        <div class="text absolute inset-0 flex justify-between flex-col h-full w-full p-2">
          <div >
            <p class="title">SAVE A DATE</p>
            <p class="date">{{ deathTimeDisplay }}</p>
          </div>
          <p class="name">{{ username }} <span style="color: #DB3A3A;">❤</span> Death</p>
          <span class=""></span>
          <span class=""></span>
          <span class=""></span>
        </div>
      </div>
      <div class="flex justify-center mt-5">
        <ButtonComponent :icon="ShareIcon" show-ad-tag template="primary" text="Share Now" @click="handleShare"/>
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
.text {
  font-family: "Wittgenstein", serif;
  font-weight: bold;
}

.title {
  color: #FF9696;
  font-size: 2rem;
}

.date {
  color: #DB3A3A;
  font-size: 1.5rem;
}

.name {
  font-family: "Wittgenstein", serif;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

/* Copy style Progress từ file trước */
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
  background: #FBFFED;
  width: 100%;
  max-width: 300px;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 2px solid #533F36;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #533F36;
  font-weight: bold;
  font-size: 0.9rem;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background: #E0E0E0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #DB3A3A; /* Đổi màu đỏ cho hợp tone "Death" */
  transition: width 0.3s ease-out;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>