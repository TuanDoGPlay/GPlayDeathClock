<script lang="ts" setup>
import Share from "@/assets/icons/share.svg";
import Add from "@/assets/icons/add.svg";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import {onMounted} from "vue";
import {goToRouter, loadRewardedVideo, showRewardedVideo} from "gplay-app-sdk";
import {EventEnum} from "@/constants/events.ts";

const emit = defineEmits(['more'])

onMounted(() => {
  loadRewardedVideo()
})

function handleAddMore() {
    emit('more')
  // showRewardedVideo(() => {
  // })
}

function handleShareClock() {
  goToRouter({
    name: 'share-clock'
  }).then(() => {
    setTimeout(()=>{
      document.dispatchEvent(new Event(EventEnum.ShareDeathStory))
    },200)
  })
}
</script>

<template>
  <div class="flex flex-col gap-3 items-center w-full h-full py-10">
    <p class="font-bold text-center ">Do you want more questions?</p>
    <p class="text-center mb-10 mx-3">More questions give better accuracy clock</p>
    <div class="flex justify-center gap-1.5">
      <ButtonComponent :icon="Add" show-ad-tag template="primary" text="Ten more" @click="handleAddMore"/>
      <ButtonComponent :icon="Share" template="primary" text="Share Clock" @click="handleShareClock"/>
    </div>
  </div>
</template>

<style scoped></style>