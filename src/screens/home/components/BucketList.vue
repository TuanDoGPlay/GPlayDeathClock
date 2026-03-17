<script lang="ts" setup>
import Star from "@/assets/icons/star.svg";
import Add from "@/assets/icons/add.svg";
import CheckboxComponent from "@/components/checkbox/CheckboxComponent.vue";
import {onMounted, ref} from "vue";
import ShareArrow from "@/assets/icons/share-arrow.svg";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import type {BucketItemData} from "@/common/types.ts";
import {CommonController} from "@/common/controller.ts";
import AddBucketPopup from "@/screens/home/popups/AddBucketPopup.vue";

const bucketList = ref<BucketItemData[]>([])
const isShowAdd = ref(false)

onMounted(() => {
  fetchData()
})

async function fetchData() {
  bucketList.value = await CommonController.getBucketList()
}

async function toggleStatus(task: BucketItemData) {
  await CommonController.editBucketItem(task)
}
</script>

<template>
  <ContentFrame :current-tab="0" :icon="Star" title="Bucket List">
    <div class="pt-2 flex flex-col justify-between h-full" style="font-size: 0.9rem">
      <div>
        <CheckboxComponent
            v-for="task in bucketList"
            :key="task.id"
            v-model="task.completed"
            :label="task.label"
            class="py-1"
            @change="toggleStatus(task)"
        >
        </CheckboxComponent>
      </div>
      <div class="flex justify-center w-full">
        <ButtonComponent :icon="Add" template="primary" text="Add New" @click="isShowAdd = true"/>
      </div>
    </div>
    <AddBucketPopup
        :is-show="isShowAdd"
        @close="isShowAdd = false"
        @submit="fetchData"
    />
  </ContentFrame>
</template>

<style scoped>

</style>