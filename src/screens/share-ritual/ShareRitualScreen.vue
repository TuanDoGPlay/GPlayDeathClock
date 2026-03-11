<script lang="ts" setup>
import Share from '@/assets/icons/share.svg'
import ShareArrow from '@/assets/icons/share-arrow.svg'
import { CommonController } from '@/common/controller';
import { type MissionInstance, type UserData } from '@/common/types';
import { Utils } from '@/common/utils';
import CheckboxComponent from '@/components/checkbox/CheckboxComponent.vue';
import ContentFrame from '@/components/content-frame/ContentFrame.vue';
import { EventEnum } from "@/constants/events.ts";
import { goToRouter, loadRewardedVideo } from 'gplay-app-sdk';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';

const missions = ref<MissionInstance[]>([])
const userData = ref<UserData>()
const timeDisplay = computed(() => {
  const totalTime = missions.value.reduce((total, mission) => total + mission.time, 0);
  return Utils.formatFullDuration(totalTime)
})

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

function shareRitual() {

}
</script>

<template>
  <ContentFrame :icon="Share" hide-split-bar show-back title="Share Rituals" @back="handleBack">
    <div class="flex flex-col justify-between h-full">
      <div class="p-1 rounded-xl mt-2  flex flex-col min-h-0" style="background-color: #FBFFED;">
        <img alt="Share Rituals" src="/share-ritual.svg" class="flex-shrink-0" />
        <div class="text flex-shrink-0">
          {{ userData?.name }} has done {{ missions.length }} {{
            missions.length > 1 ? 'rituals' :
              'ritual'
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
</style>