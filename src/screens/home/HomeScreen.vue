<script lang="ts" setup>
import Question from '@/assets/icons/question.svg'
import Share from '@/assets/icons/share.svg'
import FlipClock from "@/components/flip-clock/FlipClock.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentWrapper from "@/screens/home/ContentWrapper.vue";
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full mx-2" style="padding-top: 2.5rem">
    <FlipClock/>
    <div class="flex w-full justify-around my-5">
      <ButtonComponent :icon="Question" :text="'Questions'"/>
      <ButtonComponent :icon="Share" :text="'Share Clock'"/>
    </div>
    <ContentWrapper class="w-full flex-1"/>
  </div>
</template>

<style scoped>
</style>