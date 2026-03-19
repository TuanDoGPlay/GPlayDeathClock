<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from "vue";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  unit: "",
  disabled: false,
  direction: "horizontal",
});

const modelValue = defineModel<number>();
const scrollContainer = ref<HTMLElement | null>(null);
const isHorizontal = computed(() => props.direction === "horizontal");

const items = computed(() => {
  const result: number[] = [];
  for (let i = props.min; i <= props.max; i += props.step) {
    result.push(i);
  }
  return result;
});

let rafId = 0;
let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
let programmaticTimer: ReturnType<typeof setTimeout> | null = null;
let isProgrammaticScroll = false;

function getClosestIndex() {
  if (!scrollContainer.value) return 0;

  const container = scrollContainer.value;
  const containerCenter = isHorizontal.value
    ? container.scrollLeft + container.clientWidth / 2
    : container.scrollTop + container.clientHeight / 2;

  const itemElements = container.querySelectorAll(".picker-item");
  let closestIndex = 0;
  let minDistance = Infinity;

  itemElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    const itemCenter = isHorizontal.value
      ? htmlEl.offsetLeft + htmlEl.clientWidth / 2
      : htmlEl.offsetTop + htmlEl.clientHeight / 2;

    const distance = Math.abs(containerCenter - itemCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

async function scrollToIndex(index: number, behavior: ScrollBehavior = "smooth") {
  await nextTick();
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
  const itemElements = container.querySelectorAll(".picker-item");
  const targetItem = itemElements[index] as HTMLElement | undefined;
  if (!targetItem) return;

  isProgrammaticScroll = true;

  container.scrollTo({
    top: isHorizontal.value
      ? 0
      : targetItem.offsetTop - container.clientHeight / 2 + targetItem.clientHeight / 2,
    left: isHorizontal.value
      ? targetItem.offsetLeft - container.clientWidth / 2 + targetItem.clientWidth / 2
      : 0,
    behavior,
  });

  if (programmaticTimer) clearTimeout(programmaticTimer);
  programmaticTimer = setTimeout(() => {
    isProgrammaticScroll = false;
  }, behavior === "smooth" ? 220 : 0);
}

async function scrollToValue(val: number, behavior: ScrollBehavior = "smooth") {
  const index = items.value.indexOf(val);
  if (index === -1) return;
  await scrollToIndex(index, behavior);
}

function finalizeScrollSelection() {
  const closestIndex = getClosestIndex();
  const closestValue = items.value[closestIndex];

  if (closestValue !== undefined) {
    modelValue.value = closestValue;
  }

  scrollToIndex(closestIndex, "smooth");
}

function handleScroll() {
  if (!scrollContainer.value || props.disabled) return;

  if (scrollEndTimer) clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(() => {
    if (!isProgrammaticScroll) {
      finalizeScrollSelection();
    }
  }, 100);
}

function selectItem(item: number) {
  if (props.disabled) return;
  modelValue.value = item;
}

onMounted(() => {
  if (modelValue.value === undefined) {
    modelValue.value = props.min;
  }
  scrollToValue(modelValue.value as number, "auto");
});

watch(
  () => modelValue.value,
  (newVal, oldVal) => {
    if (newVal === undefined || newVal === oldVal) return;
    if (isProgrammaticScroll) return;
    scrollToValue(newVal, "smooth");
  }
);

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
  if (scrollEndTimer) clearTimeout(scrollEndTimer);
});
</script>

<template>
  <div class="scroll-picker" :class="[direction, { 'is-disabled': disabled }]">
    <div class="selection-overlay"></div>

    <div ref="scrollContainer" class="scroll-viewport" @scroll="handleScroll">
      <div class="edge-spacer"></div>

      <div v-for="item in items" :key="item" class="picker-item" :class="{ 'is-selected': item === modelValue }"
        @click="selectItem(item)">
        <div class="item-content">
          <span class="value-num">{{ item }}</span>
          <span v-if="item === modelValue && unit" class="unit-text">{{ unit }}</span>
        </div>
      </div>

      <div class="edge-spacer"></div>
    </div>
  </div>
</template>

<style scoped>
.scroll-picker {
  position: relative;
  overflow: hidden;
  user-select: none;
  touch-action: pan-y pan-x;
  width: 100%;
  /* Khắc phục: Đảm bảo luôn có chiều cao tối thiểu để hiện overlay */
  min-height: 5rem;
  background-color: transparent;
  /* Hoặc màu nền chung của bạn */
}

.selection-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff5ea;
  border-radius: 1rem;
  pointer-events: none;
  /* Chỉnh z-index: Để 1 là được nhưng viewport phải transparent */
  z-index: 1;
}

.scroll-viewport {
  display: flex;
  overflow: auto;
  scroll-snap-type: both mandatory;
  scrollbar-width: none;
  /* Quan trọng: z-index cao hơn để số đè lên overlay, nhưng nền phải trong suốt */
  z-index: 2;
  position: relative;
  background: transparent;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

/* Định vị Overlay dựa trên hướng */
.horizontal .selection-overlay {
  width: 4rem;
  /* Khớp với độ rộng picker-item */
  height: 3.5rem;
}

.vertical .selection-overlay {
  width: 90%;
  height: 3rem;
  /* Khớp với chiều cao picker-item */
}

/* Các phần CSS khác giữ nguyên của bạn */
.horizontal .scroll-viewport {
  flex-direction: row;
  align-items: center;
  height: 5rem;
}

.horizontal .edge-spacer {
  flex: 0 0 50%;
}

.horizontal .picker-item {
  flex: 0 0 4.5rem;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vertical .scroll-viewport {
  flex-direction: column;
  height: 18rem;
}

.vertical .edge-spacer {
  flex: 0 0 50%;
}

.vertical .picker-item {
  flex: 0 0 3.5rem;
  scroll-snap-align: center;
  scroll-snap-stop: always;
}

.picker-item {
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
  /* Đảm bảo con số luôn nằm trên cùng */
}

.item-content {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.125rem;
  color: #9ca3af;
  font-weight: 600;
  transition: all 0.2s ease;
}

.is-selected .item-content {
  color: var(--highlight-text, #d97706);
  font-weight: 800;
  transform: scale(1.25);
}
</style>