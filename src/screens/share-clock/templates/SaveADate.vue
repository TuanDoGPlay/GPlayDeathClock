<script lang="ts" setup>
import Heart from '@/assets/icons/heart.svg'
import Share from '@/assets/icons/share.svg'
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";

const emit = defineEmits(['back'])


function handleBack() {
  emit('back')
}

</script>

<template>
  <ContentFrame :icon="Heart" hide-split-bar show-back title="Save A Date" @back="handleBack">
    <div class="h-full w-full flex flex-col">
      <div class="flex-1 relative rounded-lg overflow-hidden">
        <img alt="" class="absolute w-full h-full object-cover inset-0" src="/templates/save-a-date/bg.png">
        <img alt="" class="absolute  bottom-0 right-0" src="/templates/save-a-date/death.png" style="width: 65%">
        <img alt="" class="absolute bottom-0 left-0" src="/templates/save-a-date/flower.png" style="width: 30%">
        <div class="text ">
          <p class="title">SAVE A DATE</p>
          <p class="date">25-11-2057</p>
        </div>
        <div class="name ">
          <p class="">David <span style="color: #DB3A3A;">❤</span> Death</p>
        </div>
      </div>
      <div class="flex justify-center mt-5">
        <ButtonComponent :icon="Share" show-ad-tag template="primary" text="Share Now"/>
      </div>
    </div>
  </ContentFrame>
</template>

<style scoped>
.text {
  font-family: "Wittgenstein", serif;
  position: absolute;
  top: 1rem;
  left: 1rem;
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
  position: absolute;
  top: 30%;
  left: 1rem;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>