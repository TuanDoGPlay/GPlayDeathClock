<script lang="ts" setup>
import {onMounted, ref} from "vue";
import TodayLifeRitual from "./components/TodayLifeRitual.vue";
import BucketList from "./components/BucketList.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";
import {EventEnum} from "@/constants/events.ts";

const active = ref("ritual");

onMounted(() => {
  document.dispatchEvent(new CustomEvent(EventEnum.ToggleClock, {detail: {isShow: true}}))
})
</script>

<template>
  <TabComponent v-model="active">
    <TabPane label="Ritual" name="ritual">
      <TodayLifeRitual/>
    </TabPane>

    <TabPane label="Bucket" name="bucket">
      <BucketList/>
    </TabPane>
  </TabComponent>
</template>
