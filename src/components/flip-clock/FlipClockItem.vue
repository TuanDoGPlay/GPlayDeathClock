<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";

const props = defineProps<{
  value?: number; // ✅ nhận float
  type?: "year" | "month" | "day" | "hour" | "minute" | "second";
}>();

const start = ref(0);
const end = ref(99);

function fetchStartEnd() {
  if (props.type === "year") {
    start.value = 1;
    end.value = 99;
    return;
  }
  if (props.type === "month") {
    start.value = 1;
    end.value = 12;
    return;
  }
  if (props.type === "day") {
    start.value = 1;
    end.value = 31;
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

// ✅ nhân đôi để wheel “vô tận”
const numbers = computed(() => [...baseNumbers.value, ...baseNumbers.value]);

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

function forwardSteps(prev: number, next: number, min: number, max: number) {
  const size = max - min + 1;
  const a = prev - min;
  const b = next - min;
  return (b - a + size) % size;
}

// index thực tế trong list numbers (0 .. 2*size-1) — ✅ có thể là float
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
    track.offsetHeight; // reflow
    track.style.transition = ""; // trả về transition CSS
    return;
  }

  track.style.transform = `translateY(${y}px)`;
}

async function goTo(val: number) {
  await nextTick();

  const size = end.value - start.value + 1;
  if (size <= 0) return;

  const windowEl = windowRef.value;
  const track = trackRef.value;
  if (!windowEl || !track) return;

  // ✅ nhận float
  const v = clamp(val, start.value, end.value);
  const baseIdx = v - start.value;        // float
  const baseIntIdx = Math.floor(baseIdx); // int index (0..size-1)
  const frac = baseIdx - baseIntIdx;      // 0.. <1

  // init: đặt ở cycle 2 (giữa)
  if (lastValue == null) {
    visualIndex.value = baseIntIdx + size + frac;
    setTransformByIndex(visualIndex.value, false);
    lastValue = baseIntIdx + start.value; // lưu theo "giá trị nguyên"
    return;
  }

  // ✅ tính steps theo phần nguyên (bánh răng)
  const nextIntValue = baseIntIdx + start.value;
  const steps = forwardSteps(lastValue, nextIntValue, start.value, end.value);

  // ✅ GỐC: dùng phần nguyên hiện tại của visualIndex (không mang frac cũ)
  const currentIntVisual = Math.floor(visualIndex.value);

  // ✅ target int + frac mới
  visualIndex.value = (currentIntVisual + steps) + frac;

  // apply transform
  setTransformByIndex(visualIndex.value, true);

  lastValue = nextIntValue;
}


function onTransitionEnd(e: TransitionEvent) {
  if (e.propertyName !== "transform") return;

  const size = end.value - start.value + 1;
  if (size <= 0) return;

  // nếu trôi quá xa xuống cycle 3, kéo về cycle 2 (không transition)
  if (visualIndex.value >= 2 * size) {
    visualIndex.value = visualIndex.value - size;
    setTransformByIndex(visualIndex.value, false);
  }
}

/** =========================
 *  ✅ SCALE THEO TÂM (wheel)
 *  ========================= */
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

function itemClass(i: number) {
  const s = sizeC.value;
  if (s <= 0) return "";

  // center dựa trên visualIndex (float) -> lấy phần gần nhất
  const center = normIndex(Math.round(visualIndex.value));
  const cur = normIndex(i);
  const dist = circularDist(cur, center, s);

  if (dist === 0) return "is-center";
  if (dist === 1) return "is-near";
  if (dist === 2) return "is-mid";
  return "is-far";
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
        <p v-for="(n, i) in numbers" :key="`${n}-${i}`" :class="itemClass(i)">
          {{ n }}
        </p>
        <p v-for="(n, i) in numbers" :key="`${n}-${i}`" :class="itemClass(i)">
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
  width: 3rem;
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
}

.clock-track {
  will-change: transform;
  display: flex;
  flex-direction: column;
  align-items: center;

  font-weight: bold;
  font-size: 2.2rem;
  color: white;

  transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

.clock-track p {
  height: var(--item-h);
  line-height: var(--item-h);
  margin: 0;
  padding: 0 1rem;

  transform-origin: center;
  transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1),
  opacity 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

.clock-track p.is-center {
  transform: scale(1);
}

.clock-track p.is-near {
  transform: scale(0.8);
}

.clock-track p.is-mid {
  transform: scale(0.6);
}

.clock-track p.is-far {
  transform: scale(0.4);
}
</style>
