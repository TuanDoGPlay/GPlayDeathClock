<script lang="ts" setup>
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  direction: 'horizontal'
});

const modelValue = defineModel<number>();

const items = computed(() => {
  const result = [];
  for (let i = props.min; i <= props.max; i += props.step) {
    result.push(i);
  }
  return result;
});

const initialIndex = computed(() => {
  const idx = items.value.indexOf(modelValue.value ?? props.min);
  return idx !== -1 ? idx : 0;
});

const onSlideChange = (swiper: any) => {
  const selectedValue = items.value[swiper.realIndex];
  if (selectedValue !== undefined && selectedValue !== modelValue.value) {
    modelValue.value = selectedValue;
  }
};
</script>

<template>
  <div class="scroll-picker" :class="[direction, { 'is-disabled': disabled }]">
    <!-- Đã bỏ div selection-overlay -->

    <Swiper :direction="direction" :centered-slides="true" :slides-per-view="direction === 'horizontal' ? 5 : 7"
      :initial-slide="initialIndex" :resistance-ratio="0.5" @slideChange="onSlideChange" class="picker-swiper">
      <SwiperSlide v-for="item in items" :key="item" class="picker-item">
        <!-- Sử dụng slot để lấy swiper instance cho sự kiện click -->
        <template #default="{ isActive }">
          <div class="item-content" :class="{ 'is-active': isActive }" @click="modelValue = item">
            <span class="value-num">{{ item }}</span>
          </div>
        </template>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.scroll-picker {
  position: relative;
  overflow: hidden;
  user-select: none;
  width: 100%;
}

.picker-swiper {
  width: 100%;
  height: 100%;
  -webkit-mask-image: linear-gradient(to right,
      transparent 0%,
      black 10%,
      black 50%,
      transparent 100%);
  mask-image: linear-gradient(to right,
      transparent 0%,
      black 10%,
      black 50%,
      transparent 100%);
}

/* Hướng ngang */
.horizontal .picker-swiper {
  height: 5rem;
}

/* Hướng dọc */
.vertical {
  width: 6.5rem;
  height: 18rem;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Các slide không được chọn sẽ mờ và nhỏ hơn */
  transition: all 0.3s ease;
}

.item-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  color: #9CA3AF;
  cursor: pointer;
}

.value-num {
  font-size: 1.125rem;
  font-weight: 600;
}

/* --- HIGHLIGHT LOGIC --- */

/* Khi slide nằm ở giữa (active) */
.picker-item.swiper-slide-active .item-content {
  background-color: #FFF5EA;
  /* Màu nền của overlay cũ */
  color: var(--highlight-text, #D97706);
  transform: scale(1.3);
  font-weight: 800;
}

/* Tinh chỉnh riêng cho hướng dọc để khít hơn */
.vertical .picker-item.swiper-slide-active .item-content {
  width: 85%;
  height: 2.8rem;
}

.is-disabled {
  opacity: 0.5;
  filter: grayscale(1);
  pointer-events: none;
}
</style>