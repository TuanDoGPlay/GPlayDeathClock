<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  value?: number;
  type?: "year" | "month" | "day" | "hour" | "minute" | "second";
  spinTurn?: number;
  spin?: boolean;
  spinDirection?: 'forward' | 'backward'
  duration?: number
}>(), {
  spinTurn: 0,
})

const isImpact = ref<'forward' | 'backward' | false>(false);

const start = ref(0);
const end = ref(99);

const animDuration = computed(() => {
  if (!props.spin) return 520
  if (props.duration) return props.duration
  return 2000
});

const animDurationString = computed(() => animDuration.value + 'ms');
const animTransition = computed(() => {
  if (props.spin) return 'ease-in'
  // return 'cubic-bezier(0.16, 1, 0.3, 1)'
  return 'ease-in'
});

const baseNumbers = computed(() => {
  const out: number[] = [];
  for (let i = start.value; i <= end.value; i++) out.push(i);
  return out;
});

function fetchStartEnd() {
  const map: Record<string, [number, number]> = {
    year: [0, 99],
    month: [0, 11],
    day: [0, 30],
    hour: [0, 23],
    minute: [0, 59],
    second: [0, 59],
  };
  const [s, e] = map[props.type ?? ""] ?? [0, 99];
  start.value = s;
  end.value = e;
}

const numbers = computed(() => [
  ...baseNumbers.value,
  ...baseNumbers.value,
  ...baseNumbers.value,
]);

// ─── Refs ─────────────────────────────────────────────────────────────────────

const windowRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Transform ────────────────────────────────────────────────────────────────

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
    track.offsetHeight; // force reflow
    track.style.transition = "";
    return;
  }
  track.style.transform = `translateY(${y}px)`;
}

// ─── Wrap-around ──────────────────────────────────────────────────────────────

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

  if (changed) setTransformByIndex(visualIndex.value, false);
}

// ─── Animation guard ──────────────────────────────────────────────────────────

let isAnimating = false;

function onTransitionEnd(e: TransitionEvent) {
  if (e.propertyName !== "transform") return;
  isAnimating = false;
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

  // First render — no animation, place in middle copy
  if (lastValue == null) {
    visualIndex.value = baseIdx + size;
    setTransformByIndex(visualIndex.value, false);
    lastValue = v;
    return;
  }

  const currentVis = visualIndex.value;
  const cycle = Math.floor(currentVis / size);

  let target = cycle * size + baseIdx;

  if (props.spin) {
    // Theo spinDirection
    const direction = props.spinDirection ?? "backward";
    if (direction === "backward") {
      if (target >= currentVis) target -= size;
    } else {
      if (target <= currentVis) target += size;
    }
  } else {
    // Mặc định luôn cuộn xuống (backward)
    if (target >= currentVis) target -= size;
  }

  visualIndex.value = target;
  isAnimating = true;
  setTransformByIndex(visualIndex.value, true);
  lastValue = v;
  setTimeout(() => triggerHeavyImpact(), animDuration.value);
}
let animationFrameId: number | null = null;
let isInfiniteSpinning = false;

function startInfiniteSpin(speed: number) {
  if (isInfiniteSpinning) return;
  isInfiniteSpinning = true;

  let lastTime = performance.now();

  function loop(time: number) {
    if (!isInfiniteSpinning) return;

    const dt = (time - lastTime) / 1000;
    lastTime = time;
    const size = end.value - start.value + 1;

    visualIndex.value += speed * dt;
    while (visualIndex.value >= 2 * size) visualIndex.value -= size;

    setTransformByIndex(visualIndex.value, false);
    animationFrameId = requestAnimationFrame(loop);
  }

  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(loop);
}

function stopSpinAndSettle(targetVal: number | undefined, duration = 500) {
  isInfiniteSpinning = false;
  if (trackRef.value) trackRef.value.style.transition = "none";

  const size = end.value - start.value + 1;
  const v = clamp(targetVal ?? start.value, start.value, end.value);
  const baseIdx = v - start.value;

  // Target ở vòng tiếp theo để tiếp tục cuộn xuống
  let targetIdx = Math.floor(visualIndex.value / size) * size + baseIdx;
  while (targetIdx <= visualIndex.value) targetIdx += size;

  // Overshoot thêm 30-50% 1 item nữa sau đích
  const overshootIdx = targetIdx + size * 0.4;

  const startIdx = visualIndex.value;
  const startTime = performance.now();

  const phase1Duration = duration * 0.65; // 65% thời gian để decel đến overshoot
  const phase2Duration = duration * 0.35; // 35% thời gian bounce về đích

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(time: number) {
    const elapsed = time - startTime;

    let currentIdx: number;

    if (elapsed < phase1Duration) {
      // Phase 1: decel từ start đến overshoot
      const t = elapsed / phase1Duration;
      const eased = easeOutCubic(t);
      currentIdx = startIdx + (overshootIdx - startIdx) * eased;
    } else {
      // Phase 2: bounce từ overshoot về đích
      const t = Math.min((elapsed - phase1Duration) / phase2Duration, 1);
      const eased = easeInOutQuad(t);
      currentIdx = overshootIdx + (targetIdx - overshootIdx) * eased;
    }

    while (currentIdx >= 2 * size) currentIdx -= size;
    while (currentIdx < 0) currentIdx += size;

    visualIndex.value = currentIdx;
    setTransformByIndex(currentIdx, false);

    if (elapsed < duration) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      // Snap về đúng đích
      let finalIdx = targetIdx;
      while (finalIdx >= 2 * size) finalIdx -= size;
      while (finalIdx < 0) finalIdx += size;

      visualIndex.value = finalIdx;
      setTransformByIndex(finalIdx, false);

      if (trackRef.value) trackRef.value.style.transition = "";
      animationFrameId = null;
      isAnimating = false;
      lastValue = v;
      checkWrapAround();
      triggerHeavyImpact()
    }
  }

  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(step);
}


function triggerHeavyImpact() {
  if (isImpact.value) return;
  isImpact.value = props.spinDirection ?? 'backward';
  setTimeout(() => {
    isImpact.value = false;
  }, 400);
}

async function doSpin() {
  console.log(props.type, props.spin, props.spinTurn);

  await nextTick();

  const size = end.value - start.value + 1;
  if (size <= 0) return;
  if (!windowRef.value || !trackRef.value) return;

  const totalDuration = animDuration.value;
  const settleDuration = 500;
  const spinDuration = totalDuration - settleDuration;

  const turns = props.spinTurn;
  const speed = (turns * size) / (spinDuration / 1000);

  isAnimating = true;
  startInfiniteSpin(speed);

  setTimeout(() => {
    stopSpinAndSettle(props.value);
  }, spinDuration);
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
  if (props.spin && props.spinTurn > 0) return { transform: "scale(0.6)", opacity: "0.6" };
  const s = sizeC.value;
  if (s <= 0) return {};

  const center = normIndex(Math.floor(visualIndex.value));
  const cur = normIndex(i);
  const dist = circularDist(cur, center, s);

  if (dist === 0) return { transform: "scale(1)", opacity: "1" };
  return { transform: "scale(0.6)", opacity: "0.6" };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  fetchStartEnd();
  trackRef.value?.addEventListener("transitionend", onTransitionEnd);
  await goTo(props.value ?? start.value);

});

onBeforeUnmount(() => {
  trackRef.value?.removeEventListener("transitionend", onTransitionEnd);
});

watch(
  () => [props.spin, props.spinTurn] as const,
  async ([nSpin, nTurn]) => {
    if (nSpin && nTurn > 0) await doSpin();
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
  <div class="clock-wrapper" :class="{
    'is-impact-forward': isImpact === 'forward',
    'is-impact-backward': isImpact === 'backward',
  }">
    <div ref="windowRef" class="clock-window">
      <div ref="trackRef" class="clock-track">
        <p v-for="(n, i) in numbers" :key="`n-${i}`" :style="itemStyle(i)">
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
  box-shadow:
    inset 0 0.8rem 0.6rem rgba(0, 0, 0, 0.4),
    inset 0 -0.8rem 0.6rem rgba(0, 0, 0, 0.4);
}

.clock-window {
  height: var(--window-h);
  overflow: hidden;
  background: linear-gradient(180deg,
      #000 0%,
      #4e4e4e 47.6%,
      #3a3a3a 68.24%,
      #000 100%);
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
  transition: transform v-bind(animDurationString) v-bind(animTransition);
}

.clock-track p {
  height: var(--item-h);
  line-height: var(--item-h);
  margin: 0;
  padding: 0 1rem;
  transform-origin: center;
  transition:
    transform v-bind(animDurationString) v-bind(animTransition),
    opacity v-bind(animDurationString) v-bind(animTransition);
}

@keyframes stone-impact-forward {
  0% {
    transform: translateY(0);
  }

  15% {
    transform: translateY(5px);
  }

  60% {
    transform: translateY(2px);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes stone-impact-backward {
  0% {
    transform: translateY(0);
  }

  15% {
    transform: translateY(-5px);
  }

  60% {
    transform: translateY(-2px);
  }

  100% {
    transform: translateY(0);
  }
}

.clock-wrapper.is-impact-forward {
  animation: stone-impact-forward 0.4s cubic-bezier(0.25, 1, 0.5, 1) both !important;
}

.clock-wrapper.is-impact-backward {
  animation: stone-impact-backward 0.4s cubic-bezier(0.25, 1, 0.5, 1) both !important;
}
</style>