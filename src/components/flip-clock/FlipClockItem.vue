<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{
  value?: number;
  type?: "year" | "month" | "day" | "hour" | "minute" | "second";
  scaleNear?: number;
  scaleMid?: number;
  scaleFar?: number;
  spin?: boolean;
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

function calculateSteps(prev: number, next: number, min: number, max: number) {
  const size = max - min + 1;
  let diff = next - prev;

  if (diff > size / 2) diff -= size;
  if (diff < -size / 2) diff += size;

  return diff;
}

const visualIndex = ref(0);
let lastValue: number | null = null;

const isSpinningClass = ref(false);
let isInfiniteSpinning = false;
let animationFrameId: number | null = null;
const SPIN_SPEED = 30; // Tốc độ quay liên tục

// ✅ Biến điều khiển rung "khực" khi dừng lại
const isImpact = ref(false);

function triggerHeavyImpact() {
  isImpact.value = true;
  setTimeout(() => {
    isImpact.value = false;
  }, 400); // Rung trong 400ms
}

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

  // Chuyển động bình thường êm ái
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

/** * QUAY VÔ TẬN: Chạy liên tục khi spin = true 
 */
function startInfiniteSpin() {
  if (isInfiniteSpinning) return;
  isInfiniteSpinning = true;
  isSpinningClass.value = true;
  let lastTime = performance.now();

  function loop(time: number) {
    if (!isInfiniteSpinning) return;
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    visualIndex.value += SPIN_SPEED * dt;

    const size = end.value - start.value + 1;
    while (visualIndex.value >= 2 * size) {
      visualIndex.value -= size;
    }

    setTransformByIndex(visualIndex.value, false);
    animationFrameId = requestAnimationFrame(loop);
  }

  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(loop);
}

/** * DỪNG QUAY VÀ ĐÓNG KHỰC: Gọi khi spin = false
 */
function stopSpinAndSettle(targetVal: number | undefined) {
  isInfiniteSpinning = false;
  if (targetVal == null) targetVal = start.value;

  const size = end.value - start.value + 1;
  const v = clamp(targetVal, start.value, end.value);
  const baseIdx = v - start.value;

  let targetLog = Math.floor(visualIndex.value / size) * size + baseIdx;
  while (targetLog <= visualIndex.value) {
    targetLog += size;
  }
  targetLog += size; // 1 vòng đà phanh

  const startLog = visualIndex.value;
  const startTime = performance.now();

  // Rút ngắn thời gian để lực phanh mạnh hơn
  const duration = 500;

  function step(time: number) {
    const elapsed = time - startTime;
    let progress = elapsed / duration;
    if (progress >= 1) progress = 1;

    // ✅ Gia tốc cơ học bạo lực (Ease-Out-Back mạnh)
    // Nó sẽ trượt qua điểm đích một chút rồi nảy giật ngược lại cái cạch
    const c1 = 2.5;
    const ease = 1 + (c1 + 1) * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);

    const currentLogical = startLog + (targetLog - startLog) * ease;

    let vIndex = currentLogical;
    while (vIndex >= 2 * size) vIndex -= size;
    while (vIndex < 0) vIndex += size; // Đề phòng overshoot lùi quá sâu
    visualIndex.value = vIndex;

    setTransformByIndex(visualIndex.value, false);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      animationFrameId = null;
      isSpinningClass.value = false;
      lastValue = v;
      checkWrapAround();
      triggerHeavyImpact(); // ✅ Bắn class CSS tạo hiệu ứng rung "khực"
    }
  }

  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(step);
}

async function goTo(val: number) {
  if (props.spin || isInfiniteSpinning) return;

  await nextTick();

  const size = end.value - start.value + 1;
  if (size <= 0) return;

  const windowEl = windowRef.value;
  const track = trackRef.value;
  if (!windowEl || !track) return;

  const v = clamp(val, start.value, end.value);
  const baseIdx = v - start.value;
  const baseIntIdx = Math.floor(baseIdx);
  const frac = baseIdx - baseIntIdx;

  if (lastValue == null) {
    visualIndex.value = baseIntIdx + size + frac;
    setTransformByIndex(visualIndex.value, false);
    lastValue = baseIntIdx + start.value;
    return;
  }

  const nextIntValue = baseIntIdx + start.value;
  const steps = calculateSteps(lastValue, nextIntValue, start.value, end.value);
  const currentIntVisual = Math.floor(visualIndex.value);

  visualIndex.value = (currentIntVisual + steps) + frac;

  setTransformByIndex(visualIndex.value, true); // ✅ Cuộn êm ái bằng CSS
  lastValue = nextIntValue;
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

  const center = normIndex(Math.round(visualIndex.value));
  const cur = normIndex(i);
  const dist = circularDist(cur, center, s);

  let scale = 1;
  let opacity = 1;

  if (dist === 0) {
    scale = 1;
    opacity = 1;
  } else if (dist === 1) {
    scale = props.scaleNear ?? 0.8;
    opacity = 0.8;
  } else if (dist === 2) {
    scale = props.scaleMid ?? 0.6;
    opacity = 0.5;
  } else {
    scale = props.scaleFar ?? 0.4;
    opacity = 0.2;
  }

  return {
    transform: `scale(${scale})`,
    opacity: opacity
  };
}

onMounted(async () => {
  fetchStartEnd();
  trackRef.value?.addEventListener("transitionend", onTransitionEnd);

  if (props.spin) {
    startInfiniteSpin();
  } else {
    await goTo(props.value ?? start.value);
  }
});

onBeforeUnmount(() => {
  trackRef.value?.removeEventListener("transitionend", onTransitionEnd);
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
});

watch(
  () => props.spin,
  (isSpinningNow) => {
    if (isSpinningNow) {
      startInfiniteSpin();
    } else {
      stopSpinAndSettle(props.value);
    }
  }
);

watch(
  () => props.type,
  async () => {
    fetchStartEnd();
    lastValue = null;
    if (!props.spin) await goTo(props.value ?? start.value);
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
  <div class="clock-wrapper" :class="{ 'is-impact': isImpact }">
    <div ref="windowRef" class="clock-window">
      <div ref="trackRef" class="clock-track" :class="{ 'is-spinning': isSpinningClass }">
        <p v-for="(n, i) in numbers" :key="`${n}-copy1-${i}`" :style="itemStyle(i)">
          {{ n }}
        </p>
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

/* ✅ Hiệu ứng đóng "khực" cực mạnh giống ngàm đá sập vào */
@keyframes stone-impact {
  0% {
    transform: translateY(0);
  }

  15% {
    transform: translateY(10px);
  }

  60% {
    transform: translateY(2px);
  }

  100% {
    transform: translateY(0);
  }
}

.clock-wrapper.is-impact {
  animation: stone-impact 0.4s cubic-bezier(0.25, 1, 0.5, 1) both;
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

  /* CHUYỂN ĐỘNG BÌNH THƯỜNG (GoTo): Êm ái, mượt mà */
  transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Tắt CSS khi Spin để chạy JS 60FPS */
.clock-track.is-spinning {
  transition: none !important;
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

.clock-track.is-spinning p {
  transition: none !important;
}
</style>