<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
  nextTick,
} from "vue";
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
  (e: "change", v: string): void;
}>();

const panes = reactive<Pane[]>([]);
const activeName = ref(props.modelValue);
const scrollContainer = ref<HTMLElement | null>(null);
const currentIndex = ref(0);

const isReady = ref(false);
const hasSyncedInitial = ref(false);
const isEmitting = ref(false);

let settleTimer: any = null;

// ---------- helpers ----------
const getIndexFromScroll = (el: HTMLElement) => {
  const w = el.clientWidth || 1;
  return Math.floor((el.scrollLeft + w * 0.5) / w);
};

const sortPanesByDOM = () => {
  nextTick(() => {
    panes.sort((a, b) => {
      const elA = a.el as Node | null | undefined;
      const elB = b.el as Node | null | undefined;
      if (!elA || !elB) return 0;

      const pos = elA.compareDocumentPosition(elB);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    if (!hasSyncedInitial.value) syncInitial();
  });
};

const syncInitial = async () => {
  await nextTick();

  const idxByModel = panes.findIndex((p) => p.name === props.modelValue);
  const idxFallback = panes.findIndex((p) => p.name !== "more");
  const idx =
      idxByModel >= 0 ? idxByModel : idxFallback >= 0 ? idxFallback : 0;

  currentIndex.value = Math.max(0, idx);

  const pane = panes[currentIndex.value];
  const el = scrollContainer.value;

  if (pane) {
    activeName.value = pane.name;

    isEmitting.value = true;
    emit("update:modelValue", pane.name);
    emit("change", pane.name);
    nextTick(() => (isEmitting.value = false));

    if (el) el.scrollLeft = currentIndex.value * el.clientWidth;
  }

  hasSyncedInitial.value = true;
  isReady.value = true;
};

const commitActiveFromScroll = () => {
  const el = scrollContainer.value;
  if (!el) return;

  const idx = getIndexFromScroll(el);
  currentIndex.value = idx;

  const pane = panes[idx];
  if (pane && pane.name !== activeName.value) {
    activeName.value = pane.name;

    isEmitting.value = true;
    emit("update:modelValue", pane.name);
    nextTick(() => (isEmitting.value = false));
  }
};

// ---------- provide ----------
provide(TABS_KEY, {
  activeName,
  swipe: computed(() => props.swipe),

  registerPane(pane) {
    if (!panes.find((p) => p.uid === pane.uid)) panes.push(pane);
    sortPanesByDOM();
  },

  unregisterPane(uid) {
    const idx = panes.findIndex((p) => p.uid === uid);
    if (idx >= 0) panes.splice(idx, 1);
    sortPanesByDOM();
  },
});

// ---------- scroll ----------
const handleScroll = () => {
  if (!isReady.value || !hasSyncedInitial.value) return;
  const el = scrollContainer.value;
  if (!el) return;

  const idx = getIndexFromScroll(el);
  if (idx !== currentIndex.value) currentIndex.value = idx;

  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    commitActiveFromScroll();
  }, 90);
};

const scrollToTab = (index: number) => {
  const el = scrollContainer.value;
  if (!el || index < 0 || index >= panes.length) return;

  const targetLeft = index * el.clientWidth;
  currentIndex.value = index;

  el.scrollTo({ left: targetLeft, behavior: "smooth" });

  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => commitActiveFromScroll(), 200);
};

// ---------- external model change ----------
watch(
    () => props.modelValue,
    (newVal) => {
      activeName.value = newVal;
      if (!hasSyncedInitial.value) return;
      if (isEmitting.value) return;

      const idx = panes.findIndex((p) => p.name === newVal);
      if (idx >= 0) scrollToTab(idx);
    }
);

// ---------- resize ----------
const onResize = () => {
  const el = scrollContainer.value;
  if (!el) return;
  el.scrollTo({ left: currentIndex.value * el.clientWidth, behavior: "auto" });
};

onMounted(() => {
  window.addEventListener("resize", onResize, { passive: true });

  const el = scrollContainer.value as any;
  if (el?.addEventListener) {
    el.addEventListener("scrollend", commitActiveFromScroll, { passive: true });
  }

  syncInitial();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  clearTimeout(settleTimer);

  const el = scrollContainer.value as any;
  if (el?.removeEventListener) {
    el.removeEventListener("scrollend", commitActiveFromScroll);
  }
});

defineExpose({ scrollToTab });
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <div
        ref="scrollContainer"
        :class="[
        'flex-1 flex snap-x snap-mandatory no-scrollbar custom-scroll',
        swipe ? 'overflow-x-auto' : 'overflow-x-hidden'
      ]"
        @scroll.passive="handleScroll"
    >
      <slot />
    </div>

    <div v-if="dots && panes.length > 1" class="flex justify-center items-center py-2">
      <div v-for="(_, idx) in panes" :key="idx" class="px-1.5 py-2 cursor-pointer" >
        <div :class="idx === currentIndex ? 'bg-[#535353]' : 'bg-[#D9D9D9]'"
             class="w-2 h-2 rounded-full transition-all duration-200" />
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
  scroll-behavior: auto;
  scroll-padding: 0;
}

:deep(.tab-pane) {
  flex-shrink: 0;
  width: 100%;
  snap-align: start;
  snap-stop: always;
}
</style>