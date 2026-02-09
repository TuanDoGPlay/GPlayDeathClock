<script lang="ts" setup>
import Star from "@/assets/icons/star.svg";
import Add from "@/assets/icons/add.svg";
import CheckboxComponent from "@/components/checkbox/CheckboxComponent.vue";
import {ref} from "vue";
import ShareArrow from "@/assets/icons/share-arrow.svg";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";


const tasks = ref([
  {
    id: 1,
    label: "Have a car",
    completed: true,
  },
  {
    id: 2,
    label: "Built a house for family",
    completed: true,
  },
  {
    id: 3,
    label: "Have two children",
    completed: true,
  },
  {
    id: 4,
    label: "Go to Iceland once",
    completed: false,
  },
])
</script>

<template>
  <ContentFrame :current-tab="0" :icon="Star" title="Bucket List">
    <div class="mt-2 flex flex-col justify-between h-full" style="font-size: 0.9rem">
      <div>
        <CheckboxComponent
            v-for="task in tasks"
            :key="task.id"
            v-model="task.completed"
            :label="task.label"
            class="py-1"
        >
        </CheckboxComponent>
      </div>
      <div class="flex justify-between w-full">
        <ButtonComponent :icon="Add" template="primary" text="Add New"/>
        <ButtonComponent :icon="ShareArrow" template="primary" text="Share List"/>
      </div>
    </div>
  </ContentFrame>
</template>

<style scoped>

</style>