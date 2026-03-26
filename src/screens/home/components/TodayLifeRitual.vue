<script lang="ts" setup>
import EyeQuestion from "@/assets/icons/eye-question.svg";
import ShareArrow from "@/assets/icons/share-arrow.svg";
import CheckboxComponent from "@/components/checkbox/CheckboxComponent.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import ContentFrame from "@/components/content-frame/ContentFrame.vue";
import { goToRouter } from "@gplay/app-sdk";
import { CommonController } from "@/common/controller.ts";
import { onMounted, ref } from "vue";
import type { MissionInstance } from "@/common/types.ts";

const dailyMissions = ref<MissionInstance[]>([])

onMounted(async () => {
  dailyMissions.value = await CommonController.getDailyMission()
})

async function editMission(mission: MissionInstance) {
  await CommonController.editMission(mission)
}
</script>
<template>
  <ContentFrame :current-tab="0" :icon="EyeQuestion" title="Today's Life Ritual">
    <div class="pt-2 flex flex-col justify-between h-full" style="font-size: 0.9rem">
      <div class="list-wrapper flex-1">
        <div class="list-scroll">
          <CheckboxComponent v-for="mission in dailyMissions" :key="mission.id" v-model="mission.completed"
            :label="mission.label" class="py-1" @change="editMission(mission)">
            <span :style="{ opacity: mission.completed ? 1 : 0 }" class="min-w-fit ml-1"
              style="color: var(--plus); transition: opacity 0.2s ease">
              +{{ mission.displayTime }}
            </span>
          </CheckboxComponent>
        </div>

        <div class="fade-bottom"></div>
      </div>

      <div class="pt-4">
        <ButtonComponent :icon="ShareArrow" :disabled="dailyMissions.filter(i => i.completed).length == 0"
          class="mx-auto" template="primary" text="Share Today Ritual" @click="goToRouter({ name: 'share-ritual' })" />
      </div>
    </div>
  </ContentFrame>
</template>

<style scoped>
.list-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
}

.list-scroll {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 2rem;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 0%, black 80%, transparent 100%);
}

.fade-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  pointer-events: none;
}
</style>