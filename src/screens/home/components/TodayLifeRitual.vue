<script lang="ts" setup>
import EyeQuestion from "@/assets/icons/eye-question.svg";
import ShareArrow from "@/assets/icons/share-arrow.svg";
import CheckboxComponent from "@/components/checkbox/CheckboxComponent.vue";
import {ref} from "vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";

const tasks = ref([
  {
    id: 1,
    label: "Drink a cup of water",
    subText: "+4h",
    completed: true,
  },
  {
    id: 2,
    label: "Take a shower",
    subText: "+2h",
    completed: true,
  },
  {
    id: 3,
    label: "Push-up 10 times",
    subText: "+1d 2h",
    completed: true,
  },
  {
    id: 4,
    label: "Message your eyes",
    subText: "+1d 2h",
    completed: false,
  },
  {
    id: 5,
    label: "Inhale and Exhale 5 times",
    subText: "+1d 2h",
    completed: false,
  },
])
</script>

<template>
  <ContentFrame :current-tab="0" :icon="EyeQuestion"  title="Today's Life Ritual">
    <div class="mt-2 flex flex-col justify-between h-full" style="font-size: 0.9rem">
      <div>
        <CheckboxComponent
            v-for="task in tasks"
            :key="task.id"
            v-model="task.completed"
            :label="task.label"
            class="py-1"
        >
        <span
            :style="{ opacity: task.completed ? 1 : 0 }"
            style="color: var(--plus); transition: opacity 0.2s ease"
        >{{ task.subText }}</span>
        </CheckboxComponent>
      </div>
      <ButtonComponent :icon="ShareArrow" class="mx-auto" template="primary" text="Share Today Ritual"/>
    </div>
  </ContentFrame>
</template>

<style scoped>

</style>