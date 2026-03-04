<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from "vue";
import { type Pane, TABS_KEY } from "./tabContext";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    dots?: boolean;
    swipe?: boolean;
  }>(),
  { dots: true, swipe: true }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const panes = reactive<Pane[]>([]);
const activeName = ref(props.modelValue);
const scrollContainer = ref<HTMLElement | null>(null);
const currentIndex = ref(0);

let isManualScrolling = false;
let scrollTimeout: any = null;

provide(TABS_KEY, {
  activeName,
  swipe: computed(() => props.swipe),
  registerPane(pane) {
    if (!panes.find((p) => p.uid === pane.uid)) panes.push(pane);
  },
  unregisterPane(uid) {
    const idx = panes.findIndex((p) => p.uid === uid);
    if (idx >= 0) panes.splice(idx, 1);
  },
});

const handleScroll = () => {
  const el = scrollContainer.value;
  if (!el || isManualScrolling) return;

  const width = el.clientWidth;
  if (width === 0) return;

  const idx = Math.round(el.scrollLeft / width);
  if (idx !== currentIndex.value) {
    currentIndex.value = idx;
    const pane = panes[idx];
    if (pane && pane.name !== activeName.value) {
      activeName.value = pane.name;
      emit("update:modelValue", pane.name);
    }
  }
};

const scrollToTab = (index: number) => {
  const el = scrollContainer.value;
  if (!el || index < 0 || index >= panes.length) return;

  isManualScrolling = true;
  currentIndex.value = index;

  // Sử dụng scrollTo nhưng ép hiệu ứng mượt qua CSS class hoặc behavior
  el.scrollTo({
    left: index * el.clientWidth,
    behavior: "smooth",
  });

  // Giảm thời gian chờ xuống 300ms để cảm giác phản hồi nhanh hơn
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isManualScrolling = false;
  }, 300);

  const pane = panes[index];
  if (pane && pane.name !== activeName.value) {
    activeName.value = pane.name;
    emit("update:modelValue", pane.name);
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === activeName.value) return;
    activeName.value = newVal;
    const idx = panes.findIndex((p) => p.name === newVal);
    if (idx >= 0) {
      const el = scrollContainer.value;
      if (el) {
        const currentPosIdx = Math.round(el.scrollLeft / el.clientWidth);
        if (currentPosIdx !== idx) scrollToTab(idx);
      }
    }
  }
);

const onResize = () => {
  const el = scrollContainer.value;
  if (!el) return;
  el.scrollTo({ left: currentIndex.value * el.clientWidth, behavior: "auto" });
};

onMounted(() => {
  window.addEventListener("resize", onResize, { passive: true });
  requestAnimationFrame(() => {
    const el = scrollContainer.value;
    if (el && activeName.value) {
      const idx = panes.findIndex(p => p.name === activeName.value);
      if (idx >= 0) {
        el.scrollLeft = idx * el.clientWidth;
        currentIndex.value = idx;
      }
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  clearTimeout(scrollTimeout);
});

defineExpose({ scrollToTab });
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <div v-if="swipe" ref="scrollContainer"
      class="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar custom-scroll"
      @scroll.passive="handleScroll">
      <slot />
    </div>

    <div v-else class="flex-1 overflow-hidden">
      <slot />
    </div>

    <div v-if="dots && panes.length > 1" class="flex justify-center items-center py-2">
      <div v-for="(_, idx) in panes" :key="idx" class="px-1.5 py-2 cursor-pointer" @click="scrollToTab(idx)">
        <div :class="idx === currentIndex ? 'bg-[#535353]' : 'bg-[#D9D9D9]'"
          class="w-2 h-2 rounded-full transition-all duration-200"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scroll {
  /* Tăng tốc độ cuộn smooth trên một số trình duyệt */
  scroll-behavior: smooth;
  scroll-padding: 0;
}

:deep(.tab-pane) {
  flex-shrink: 0;
  width: 100%;
  snap-align: start;
  /* Luôn dừng đúng tab, không trượt lố */
  snap-stop: always;
}

/* Ép tốc độ scroll nhanh hơn nếu trình duyệt hỗ trợ */
@media (prefers-reduced-motion: no-preference) {
  .custom-scroll {
    scroll-behavior: smooth;
  }
}
</style>