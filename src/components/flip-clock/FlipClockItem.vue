<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{
  value?: number;
  type?: "year" | "month" | "day" | "hour" | "minute" | "second";
  spinSpeed?: number
  spin?: boolean
  spinDirection?: 'backward' | 'forward'
}>();

const start = ref(0);
const end = ref(99);
const animDuration = computed(() => (props.spin ? '2000ms' : '520ms'));
function fetchStartEnd() {
  if (props.type === "year") {
    start.value = 0;
    end.value = 99;
    return;
  }
  if (props.type === "month") {
    start.value = 0;
    end.value = 11;
    return;
  }
  if (props.type === "day") {
    start.value = 0;
    end.value = 30;
    return;
  }
  if (props.type === "hour") {
    start.value = 0;
    end.value = 23;
    return;
  }
  if (props.type === "minute") {
    start.value = 0;
    end.value = 59;
    return;
  }
  if (props.type === "second") {
    start.value = 0;
    end.value = 59;
    return;
  }
  start.value = 0;
  end.value = 99;
}

const baseNumbers = computed(() => {
  const out: number[] = [];
  for (let i = start.value; i <= end.value; i++) out.push(i);
  return out;
});

const numbers = computed(() => [
  ...baseNumbers.value,
  ...baseNumbers.value,
  ...baseNumbers.value
]);

const windowRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function remToPx(rem: number) {
  const root = getComputedStyle(document.documentElement).fontSize;
  return parseFloat(root) * rem;
}

function getItemHeightPx(fromEl: HTMLElement) {
  const raw = getComputedStyle(fromEl).getPropertyValue("--item-h").trim();
  if (!raw) return remToPx(4.375);
  if (raw.endsWith("rem")) return remToPx(parseFloat(raw));
  if (raw.endsWith("px")) return parseFloat(raw);
  return remToPx(parseFloat(raw));
}

const visualIndex = ref(0);
let lastValue: number | null = null;

function computeYByIndex(idx: number, windowEl: HTMLElement) {
  const itemH = getItemHeightPx(windowEl);
  const windowH = windowEl.getBoundingClientRect().height;
  const offset = windowH / 2 - itemH / 2;
  return -(idx * itemH) + offset;
}

function setTransformByIndex(idx: number, withTransition: boolean) {
  const track = trackRef.value;
  const windowEl = windowRef.value;
  if (!track || !windowEl) return;

  const y = computeYByIndex(idx, windowEl);
  if (!withTransition) {
    track.style.transition = "none";
    track.style.transform = `translateY(${y}px)`;
    track.offsetHeight;
    track.style.transition = "";
    return;
  }
  track.style.transform = `translateY(${y}px)`;
}

function checkWrapAround() {
  const size = end.value - start.value + 1;
  if (size <= 0) return;

  let changed = false;
  while (visualIndex.value >= 2 * size) {
    visualIndex.value -= size;
    changed = true;
  }
  while (visualIndex.value < size) {
    visualIndex.value += size;
    changed = true;
  }

  if (changed) {
    setTransformByIndex(visualIndex.value, false);
  }
}

function onTransitionEnd(e: TransitionEvent) {
  if (e.propertyName !== "transform") return;
  checkWrapAround();
}
async function goTo(val: number) {
  await nextTick();

  const size = end.value - start.value + 1;
  if (size <= 0) return;

  const windowEl = windowRef.value;
  const track = trackRef.value;
  if (!windowEl || !track) return;

  const v = clamp(val, start.value, end.value);
  const baseIdx = v - start.value;

  if (lastValue == null) {
    visualIndex.value = baseIdx + size;
    setTransformByIndex(visualIndex.value, false);
    lastValue = v;
    return;
  }
  const currentVis = visualIndex.value;
  const cycle = Math.floor(currentVis / size);

  const candidates = [
    (cycle - 1) * size + baseIdx,
    cycle * size + baseIdx,
    (cycle + 1) * size + baseIdx,
  ];
  const best = candidates.reduce((prev, curr) =>
    Math.abs(curr - currentVis) < Math.abs(prev - currentVis) ? curr : prev
  );

  visualIndex.value = best;
  setTransformByIndex(visualIndex.value, true);
  lastValue = v;
}
const sizeC = computed(() => end.value - start.value + 1);

function normIndex(i: number) {
  const s = sizeC.value;
  if (s <= 0) return 0;
  return ((i % s) + s) % s;
}

function circularDist(a: number, b: number, s: number) {
  const d = Math.abs(a - b);
  return Math.min(d, s - d);
}

function itemStyle(i: number) {
  const s = sizeC.value;
  if (s <= 0) return {};

  const center = normIndex(Math.floor(visualIndex.value));
  const cur = normIndex(i);
  const dist = circularDist(cur, center, s);

  let scale = 1;
  let opacity = 1;

  if (dist === 0) {
    scale = 1;
    opacity = 1;
  } else {
    scale = 0.6
    opacity = 0.6;
  }

  return {
    transform: `scale(${scale})`,
    opacity: opacity
  };
}

onMounted(async () => {
  fetchStartEnd();
  trackRef.value?.addEventListener("transitionend", onTransitionEnd);
  await goTo(props.value ?? start.value);
});

onBeforeUnmount(() => {
  trackRef.value?.removeEventListener("transitionend", onTransitionEnd);
});

watch(
  () => props.type,
  async () => {
    fetchStartEnd();
    lastValue = null;
    await goTo(props.value ?? start.value);
  }
);

watch(
  () => props.value,
  async (nv) => {
    if (nv == null) return;
    await goTo(nv);
  }
);
</script>

<template>
  <div class="clock-wrapper">
    <div ref="windowRef" class="clock-window">
      <div ref="trackRef" class="clock-track">
        <p v-for="(n, i) in numbers" :key="`${n}-copy1-${i}`" :style="itemStyle(i)">
          {{ n }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clock-wrapper {
  --window-h: 4rem;
  --item-h: 2rem;
  width: 100%;
  position: relative;
  height: var(--window-h);
}

.clock-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  box-shadow: inset 0 0.8rem 0.6rem rgba(0, 0, 0, 0.4),
    inset 0 -0.8rem 0.6rem rgba(0, 0, 0, 0.4);
}

.clock-window {
  height: var(--window-h);
  overflow: hidden;
  background: linear-gradient(180deg, #000 0%, #4e4e4e 47.6%, #3a3a3a 68.24%, #000 100%);
  border-radius: 4px;
}

.clock-track {
  will-change: transform;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  font-size: 2.2rem;
  color: white;
  /* Thay 520ms bằng v-bind */
  transition: transform v-bind(animDuration) cubic-bezier(0.16, 1, 0.3, 1);
}

.clock-track p {
  height: var(--item-h);
  line-height: var(--item-h);
  margin: 0;
  padding: 0 1rem;
  transform-origin: center;
  /* Thay 520ms bằng v-bind cho cả 2 thuộc tính */
  transition: transform v-bind(animDuration) cubic-bezier(0.16, 1, 0.3, 1),
    opacity v-bind(animDuration) cubic-bezier(0.16, 1, 0.3, 1);
}
</style>