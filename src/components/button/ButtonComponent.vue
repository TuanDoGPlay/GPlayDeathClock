<script lang="ts" setup>
import { computed } from "vue";
import AdTag from "@/components/ad-tag/AdTag.vue";

const props = defineProps<{
  icon?: string
  text?: string
  template?: 'primary'
  showAdTag?: boolean
  fontSize?: string
  iconRight?: boolean
  disabled?: boolean // ✅ Thêm prop disabled
}>()

const background = computed(() => {
  if (props.disabled) return '#F3F4F6' // ✅ Màu nền khi disable (xám nhạt)
  if (props.template === 'primary') return '#FFF5EA'
  return 'var(--panel-theme-1)'
})

const borderColor = computed(() => {
  if (props.disabled) return '#E5E7EB' // ✅ Màu viền khi disable
  if (props.template === 'primary') return '#EED8C0'
  return 'var(--panel-theme-1)'
})

// Tạo computed để quản lý style linh hoạt hơn
const containerStyle = computed(() => ({
  background: background.value,
  borderColor: borderColor.value,
  fontSize: props.fontSize || '0.875rem'
}))
</script>

<template>
  <div :style="containerStyle" class="custom" :class="{ 'is-disabled': props.disabled }">
    <AdTag v-if="props.showAdTag" class="ad" />
    <component v-if="props.icon && !iconRight" :is="props.icon" class="icon" />
    <span class="text">{{ props.text }}</span>
    <component v-if="props.icon && iconRight" :is="props.icon" class="icon" />
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
  border-style: solid;
  /* ✅ Đảm bảo border hiển thị đúng */
  border-radius: 2rem;
  color: var(--highlight-text);
  width: fit-content;
  cursor: pointer;
  /* Thêm con trỏ mặc định */
  transition: all 0.2s ease;
  /* Thêm hiệu ứng chuyển đổi mượt mà */
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

/* ✅ Style cho trạng thái disable */
.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
  /* Làm mờ component */
  color: #9CA3AF;
  /* Đổi màu chữ sang xám */
  pointer-events: none;
  /* Chặn mọi thao tác click/hover */
}

/* * Lưu ý: pointer-events: none sẽ chặn luôn việc hiển thị cursor: not-allowed. 
 * Nếu bạn muốn người dùng vẫn thấy con trỏ chuột not-allowed khi hover, 
 * bạn có thể bỏ 'pointer-events: none' đi và chặn sự kiện click ở component cha.
 */
</style>