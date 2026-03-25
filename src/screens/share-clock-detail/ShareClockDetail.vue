<script lang="ts" setup>
import {Utils} from "@/common/utils.ts";
import {goToRouter} from "gplay-app-sdk";
import {EventEnum} from "@/constants/events.ts";
import {onBeforeUnmount, onMounted} from "vue";

const templateId = parseInt(window.location.pathname.split('/').pop() || '0')

onMounted(() => {
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: false}}))
})

onBeforeUnmount(() => {
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: true}}))
})

function handleBack() {
  goToRouter({
    name: 'share-clock',
  })
}
</script>

<template>
  <div class="h-full">
    <Component :is="Utils.getShareTemplateComponentById(templateId)" @back="handleBack"/>
  </div>
</template>

<style scoped>

</style>