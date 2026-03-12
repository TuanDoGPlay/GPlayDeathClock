<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 24,
  step: 1,
  unit: "",
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

const progressPercent = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

const containerStyle = computed(() => ({
  background: props.disabled ? '#F3F4F6' : '#FFF5EA',
  opacity: props.disabled ? 0.6 : 1
}));

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};
</script>

<template>
  <div
      class="slider-wrapper"
      :style="containerStyle"
      :class="{ 'is-disabled': disabled }"
      @pointerdown.stop
  >
    <div class="slider-info">
      <span class="value-text">{{ modelValue }}{{ unit }}</span>
    </div>

    <div class="range-container">
      <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="modelValue"
          :disabled="disabled"
          @input="handleInput"
          class="custom-range"
          :style="{ '--progress': progressPercent + '%' }"
      />
    </div>

    <div class="labels">
      <span>{{ min }}{{ unit }}</span>
      <span>{{ max }}{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.slider-wrapper {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.5rem; /* Giảm padding ngang để 2 đầu mút sát lề hơn */
  border: none; /* Bỏ viền hoàn toàn */
  border-radius: 1.5rem;
  width: 100%;
  transition: all 0.2s ease;
  user-select: none;
  touch-action: none; /* Quan trọng: Ngăn trình duyệt can thiệp vuốt mặc định */
}

.slider-info {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.value-text {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--highlight-text);
}

.range-container {
  padding: 0.25rem 0; /* Thu nhỏ khoảng cách dọc */
  display: flex;
  align-items: center;
}

.custom-range {
  -webkit-appearance: none;
  width: 100%;
  height: 0.5rem;
  border-radius: 1rem;
  background: linear-gradient(to right, #EED8C0 var(--progress), #E5E7EB var(--progress));
  outline: none;
  cursor: pointer;
  margin: 0; /* Đảm bảo không có margin ngoài làm hở lề */
}

/* Chrome, Safari, Opera, Edge */
.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  background: #FFFFFF;
  border: 0.2rem solid #EED8C0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Firefox */
.custom-range::-moz-range-thumb {
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  background: #FFFFFF;
  border: 0.2rem solid #EED8C0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.labels {
  display: flex;
  justify-content: space-between;
  padding: 0 0.25rem; /* Căn chỉnh nhãn sát với điểm mút */
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
}

.is-disabled {
  cursor: not-allowed;
}

.is-disabled .custom-range::-webkit-slider-thumb {
  background: #D1D5DB;
  border-color: #E5E7EB;
}
</style>