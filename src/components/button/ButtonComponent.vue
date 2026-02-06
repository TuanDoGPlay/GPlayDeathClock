<script lang="ts" setup>
import {computed} from "vue";
import AdTag from "@/components/ad-tag/AdTag.vue";

const props = defineProps<{
  icon?: string
  text?: string
  template?: 'primary'
  showAdTag?:boolean
  fontSize?:string
}>()

const background = computed(() => {
  if (props.template === 'primary') return '#FFF5EA'
  return 'var(--panel-theme-1)'
})

const borderColor = computed(() => {
  if (props.template === 'primary') return '#EED8C0'
  return 'var(--panel-theme-1)'
})

// ✅ Tạo computed để quản lý style linh hoạt hơn
const containerStyle = computed(() => ({
  background: background.value,
  borderColor: borderColor.value,
  fontSize: props.fontSize || '0.875rem'
}))
</script>

<template>
  <div :style="containerStyle" class="custom">
    <AdTag v-if="props.showAdTag" class="ad"/>
    <component v-if="props.icon" :is="props.icon" class="icon"/>
    <span class="text">{{ props.text }}</span>
  </div>
</template>

<style scoped>
.custom {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-width: 0.1rem;
  border-radius: 2rem;
  color: var(--highlight-text);
  width: fit-content;
}

.ad {
  position: absolute;
  top: -0.5rem;
  right: -0.25rem;
}

.icon {
  height: 1.25rem;
  width: 1.25rem;
}

.text {
  font-weight: 600;
}
</style>