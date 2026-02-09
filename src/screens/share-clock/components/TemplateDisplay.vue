<script lang="ts" setup>
import {Utils} from "@/common/utils.ts";

const props = defineProps<{
  templateId: number;
}>()
const emit = defineEmits(['back'])

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="h-full">
    <Component :is="Utils.getShareTemplateComponentById(props.templateId)" @back="handleBack"/>
  </div>
</template>

<style scoped>

</style>