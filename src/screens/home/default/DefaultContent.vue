<script lang="ts" setup>
import {ref} from 'vue'
import TodayLifeRitual from "@/screens/home/default/items/TodayLifeRitual.vue";
import BucketList from "@/screens/home/default/items/BucketList.vue";

const scrollContainer = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  currentIndex.value = Math.round(container.scrollLeft / container.clientWidth)
}

const scrollToTab = (index: number) => {
  if (!scrollContainer.value) return

  const width = scrollContainer.value.clientWidth
  scrollContainer.value.scrollTo({
    left: index * width,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden">

    <div
        ref="scrollContainer"
        class="flex-1 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        @scroll="handleScroll"
    >
      <div class="flex w-[200%] h-full">
        <div class="w-1/2 h-full snap-start overflow-y-auto">
          <TodayLifeRitual/>
        </div>
        <div class="w-1/2 h-full snap-start overflow-y-auto">
          <BucketList/>
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center py-2">
      <div
          v-for="i in 2"
          :key="i"
          class="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer p-1 box-content"
          @click="scrollToTab(i - 1)"
      >
        <div
            :style="{
            backgroundColor: (i - 1) === currentIndex
              ? 'var(--secondary-text)'
              : 'var(--color-gray)'
          }"
            class="w-full h-full rounded-full"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>