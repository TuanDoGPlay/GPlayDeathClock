<script lang="ts" setup>
import ShareIcon from '@/assets/icons/share.svg'
import ShareArrow from '@/assets/icons/share-arrow.svg'
import { CommonController } from '@/common/controller';
import { type MissionInstance, type UserData } from '@/common/types';
import { Utils } from '@/common/utils';
import CheckboxComponent from '@/components/checkbox/CheckboxComponent.vue';
import ContentFrame from '@/components/content-frame/ContentFrame.vue';
import { EventEnum } from "@/constants/events.ts";
import { captureImage, goToRouter, loadRewardedVideo } from 'gplay-app-sdk';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from '@capacitor/share';

const missions = ref<MissionInstance[]>([])
const userData = ref<UserData>()
const timeDisplay = computed(() => {
  const totalTime = missions.value.reduce((total, mission) => total + mission.time, 0);
  return Utils.formatFullDuration(totalTime)
})

// Trạng thái Loading & Progress
const isSharing = ref(false);
const progress = ref(0);
const progressText = ref('Initializing...');

onBeforeMount(async () => {
  userData.value = await CommonController.getUserData()
  missions.value = await CommonController.getCompletedMission()
  loadRewardedVideo()
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, { detail: { isShow: false } }))
})

onBeforeUnmount(() => {
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, { detail: { isShow: true } }))
})

function handleBack() {
  goToRouter('home')
}

async function shareRitual() {
  if (isSharing.value) return;

  isSharing.value = true;
  progress.value = 10;
  progressText.value = 'Capturing screen...';

  try {
    // 1. Chụp ảnh màn hình
    const base64Data = await captureImage({
      elementId: 'capture-area',
    });
    progress.value = 40;
    progressText.value = 'Saving image...';

    // 2. Lưu file vào cache
    const fileName = `share-ritual-${Date.now()}.png`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    progress.value = 80;
    progressText.value = 'Opening share menu...';

    // 3. Chia sẻ
    await Share.share({
      files: [savedFile.uri],
    });

    progress.value = 100;
  } catch (e) {
    console.error('Failed to share ritual:', e);
  } finally {
    // Đợi một chút để người dùng thấy 100% rồi mới đóng
    setTimeout(() => {
      isSharing.value = false;
      progress.value = 0;
    }, 500);
  }
}
</script>

<template>
  <ContentFrame :icon="ShareIcon" hide-split-bar show-back title="Share Rituals" @back="handleBack">
    <div class="flex flex-col justify-between h-full pt-2">
      <div id="capture-area" class="p-1 rounded-xl flex flex-col min-h-0" style="background-color: #FBFFED;">
        <img alt="Share Rituals" class="flex-shrink-0" src="/share-ritual.svg" />
        <div class="text flex-shrink-0">
          {{ userData?.name }} has done {{ missions.length }} {{
            missions.length > 1 ? 'rituals' : 'ritual'
          }}
          and get {{ timeDisplay }} more in his boring life
        </div>
        <div class="flex-1 overflow-y-auto w-full min-h-0" style="font-size: 0.9rem;">
          <CheckboxComponent v-for="mission in missions" :key="mission.id" v-model="mission.completed"
                             :label="mission.label" class="py-1">
            <span :style="{ opacity: mission.completed ? 1 : 0 }" class="min-w-fit ml-1"
                  style="color: var(--plus); transition: opacity 0.2s ease">+{{
                mission.displayTime
              }}</span>
          </CheckboxComponent>
        </div>
      </div>
      <div class="pt-4 flex-shrink-0">
        <ButtonComponent :icon="ShareArrow" class="mx-auto" show-ad-tag template="primary" text="Share Now"
                         @click="shareRitual" />
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
            <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>
    </Transition>
  </ContentFrame>
</template>

<style scoped>
.text {
  color: #533F36;
  text-align: center;
  font-family: "Crimson Pro", serif;
  font-weight: 600;
  margin-left: 2rem;
  margin-right: 2rem;
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
  background: #FBFFED;
  width: 100%;
  max-width: 300px;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border: 2px solid #533F36;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #533F36;
  font-family: "Crimson Pro", serif;
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
  background: #533F36; /* Màu nâu cùng tone với app */
  transition: width 0.3s ease-out;
}

/* Hiệu ứng đóng mở popup */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>