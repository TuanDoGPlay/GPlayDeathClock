<script lang="ts" setup>
import {ref} from "vue";
import TodayLifeRitual from "./components/TodayLifeRitual.vue";
import BucketList from "./components/BucketList.vue";
import TabComponent from "@/components/tab/TabComponent.vue";
import TabPane from "@/components/tab/TabPane.vue";

const active = ref("ritual");
</script>

<template>
  <TabComponent v-model="active" :dots="true" :swipe="true">
    <TabPane label="Ritual" name="ritual">
      <TodayLifeRitual/>
    </TabPane>

    <TabPane label="Bucket" name="bucket">
      <BucketList/>
    </TabPane>
  </TabComponent>
</template>
