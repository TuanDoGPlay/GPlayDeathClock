<script lang="ts" setup>
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  unit: "",
  disabled: false,
  direction: 'horizontal'
});

const modelValue = defineModel<number>();

// Danh sách các số
const items = computed(() => {
  const result = [];
  for (let i = props.min; i <= props.max; i += props.step) {
    result.push(i);
  }
  return result;
});

// Tìm slide khởi tạo dựa trên modelValue
const initialIndex = computed(() => {
  const idx = items.value.indexOf(modelValue.value ?? props.min);
  return idx !== -1 ? idx : 0;
});

// Xử lý khi slide thay đổi (chọn số mới)
const onSlideChange = (swiper: any) => {
  const selectedValue = items.value[swiper.realIndex];
  if (selectedValue !== undefined && selectedValue !== modelValue.value) {
    modelValue.value = selectedValue;
  }
};

// Hiệu ứng: Chỉ Slide ở giữa mới to (Scale 1.5), còn lại bằng nhau (Scale 1)
const onProgress = (swiper: any) => {
  const slides = swiper.slides;
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const progress = Math.abs(slide.progress);
  }
};
</script>

<template>
  <div class="scroll-picker" :class="[direction, { 'is-disabled': disabled }]">
    <!-- Lớp phủ highlight ở giữa -->
    <div class="selection-overlay"></div>

    <Swiper :direction="direction" :centered-slides="true" :slides-per-view="direction === 'horizontal' ? 3 : 5"
      :initial-slide="initialIndex" :watch-slides-progress="true" :resistance-ratio="0.5" @slideChange="onSlideChange"
      @progress="onProgress" class="picker-swiper">
      <SwiperSlide v-for="item in items" :key="item" class="picker-item"
        @click="(swiper: any) => swiper.slideTo(items.indexOf(item))">
        <div class="item-content">
          <span class="value-num">{{ item }}</span>
          <span v-if="item === modelValue" class="unit-text">{{ unit }}</span>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.scroll-picker {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  user-select: none;
  width: 100%;
}

.picker-swiper {
  width: 100%;
  height: 100%;
}

/* Kích thước theo hướng */
.horizontal .picker-swiper {
  height: 6rem;
}

.vertical {
  width: 6.5rem;
  height: 15rem;
}

/* SwiperSlide mặc định là flex, ta cần căn giữa nội dung bên trong */
.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  scale: 0.8;
}

.item-content {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
}

.value-num {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Màu chữ khi được chọn */
.picker-item[class*="swiper-slide-active"] {
  color: var(--highlight-text, #D97706);
  font-weight: 700;
  scale: 1.25;
}

.unit-text {
  font-size: 0.75rem;
  font-weight: 700;
}

/* Vùng Highlight Box */
.selection-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #FFF5EA;
  border-radius: 1rem;
  pointer-events: none;
}

.horizontal .selection-overlay {
  width: 3.5rem;
  height: 70%;
}

.vertical .selection-overlay {
  width: 85%;
  height: 3rem;
}

.is-disabled {
  opacity: 0.5;
  filter: grayscale(1);
  pointer-events: none;
}
</style>