<script lang="ts" setup>
import Left from "@/assets/icons/left.svg";

const props = defineProps<{
  icon: string
  title: string
  showPagination?: boolean
  showPaginationInTitle?: boolean
  currentTab?: number
  totalTab?: number
  showBack?: boolean
}>()

const emit = defineEmits(['back'])
</script>

<template>
  <div class="p-3 flex flex-col h-full">
    <div class="flex gap-2 items-center justify-center border-b border-gray-500 pb-2">
      <Left v-if="props.showBack" class="h-5 w-5 cursor-pointer absolute left-4" @click="emit('back')"/>
      <Component :is="props.icon" class="h-5 w-5" style="color: var(--highlight-text)"/>
      <span class="font-bold" style="font-size: 0.9rem">{{ props.title }}</span>
    </div>
    <div class="flex-1">
      <slot/>
    </div>
    <div v-if="props.showPagination" class="flex justify-center items-center gap-2">
      <div
          v-for="index in props.totalTab"
          :key="index"
          :style="{
        backgroundColor: index - 1 === props.currentTab
          ? '#535353'
          : '#D9D9D9'
      }"
          class="w-2 h-2 rounded-full transition-all duration-300"
      ></div>
    </div>
  </div>
</template>

<style scoped>

</style>