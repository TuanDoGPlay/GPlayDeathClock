<script lang="ts" setup>
import { computed, ref, watch, onBeforeUnmount, onMounted } from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";
import { EventEnum } from "@/constants/events";
import { CommonController } from "@/common/controller";

const props = defineProps<{
  showLabel?: boolean;
}>();

const isSpin = ref(false);
const isCanTick = ref(true);

// ✅ Tạo các biến trạng thái spin độc lập cho từng cột
const spinYear = ref(isSpin.value);
const spinMonth = ref(isSpin.value);
const spinDay = ref(isSpin.value);
const spinHour = ref(isSpin.value);
const spinMinute = ref(isSpin.value);
const spinSecond = ref(isSpin.value);

const yearDiffText = ref("");
const monthDiffText = ref("");
const dayDiffText = ref("");
const hourDiffText = ref("");
const minuteDiffText = ref("");
const secondDiffText = ref("");

const showYearDiff = ref(false);
const showMonthDiff = ref(false);
const showDayDiff = ref(false);
const showHourDiff = ref(false);
const showMinuteDiff = ref(false);
const showSecondDiff = ref(false);

const spinFrom = ref<"year" | "month" | "day" | "hour" | "minute" | "second" | null>(null);

const time = ref(0)
const dateInstance = computed(() => {
  return new Date(time.value)
});
const isShowChange = computed(() => {
  return showYearDiff.value || showMonthDiff.value || showDayDiff.value || showDayDiff.value || showHourDiff.value || showMinuteDiff.value || showSecondDiff.value
});

const second = computed(() => {
  const s = dateInstance.value.getSeconds();
  const ms = dateInstance.value.getMilliseconds();
  return parseFloat((s + ms / 1000).toFixed(0));
});

const minute = computed(() => {
  return dateInstance.value.getMinutes() + second.value / 60;
});

const hour = computed(() => {
  return (dateInstance.value.getHours() % 24) + minute.value / 60;
});

const day = computed(() => {
  return dateInstance.value.getDate() + hour.value / 24;
});

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const month = computed(() => {
  const m = dateInstance.value.getMonth(); // 0-11
  const d = dateInstance.value.getDate() - 1 + hour.value / 24;
  const dim = daysInMonth(dateInstance.value.getFullYear(), m);
  return m + 1 + d / dim;
});

const year = computed(() => {
  return (dateInstance.value.getFullYear() % 100) + (month.value - 1) / 12;
});

// Biến lưu trữ các timeout để dọn dẹp nếu người dùng bật spin lại khi chưa dừng xong
let stopTimeouts: ReturnType<typeof setTimeout>[] = [];

let timer: number | undefined;

onMounted(async () => {
  time.value = await CommonController.getRemainLiveTime();
  timer = window.setInterval(() => {
    if (isCanTick.value) time.value -= 1000;
  }, 1000);

  document.addEventListener(EventEnum.ChangeTime, async () => {
    isSpin.value = true
    await fetchRemainLiveTime();
    isSpin.value = false
  });
})

watch(
  () => isSpin.value,
  (newSpin) => {
    clearStaggeredTimeouts();

    if (newSpin) {
      // Bật quay: Tất cả quay cùng một lúc
      spinYear.value = true;
      spinMonth.value = true;
      spinDay.value = true;
      spinHour.value = true;
      spinMinute.value = true;
      spinSecond.value = true;

      isCanTick.value = false
    } else {
      // Tắt quay: Tắt nối tiếp cách nhau 0.5s (từ phải qua trái)
      spinSecond.value = false; // Dừng giây ngay lập tức

      stopTimeouts.push(setTimeout(() => { spinMinute.value = false; }, 500));
      stopTimeouts.push(setTimeout(() => { spinHour.value = false; }, 1000));
      stopTimeouts.push(setTimeout(() => { spinDay.value = false; }, 1500));
      stopTimeouts.push(setTimeout(() => { spinMonth.value = false; }, 2000));
      stopTimeouts.push(setTimeout(() => { spinYear.value = false; }, 2500)); // Năm dừng cuối cùng

      stopTimeouts.push(setTimeout(() => { isCanTick.value = true; }, 3000));
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  clearStaggeredTimeouts();
  clearDiffTimeouts()
});

async function fetchRemainLiveTime() {
  const prev = time.value;
  console.log('prev', time.value);

  const next = await CommonController.getRemainLiveTime();

  time.value = next;
  console.log(prev, next);

  showChangedParts(next - prev);
}

function clearStaggeredTimeouts() {
  stopTimeouts.forEach(clearTimeout);
  stopTimeouts = [];
}

function formatDiffText(diff: number, unit: string) {
  if (diff === 0) return "";
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff} ${unit}`;
}

let diffTimeouts: ReturnType<typeof setTimeout>[] = [];

function clearDiffTimeouts() {
  diffTimeouts.forEach(clearTimeout);
  diffTimeouts = [];
}

function showDiff(
  target: "year" | "month" | "day" | "hour" | "minute" | "second",
  diff: number
) {
  if (!diff) return;

  if (target === "year") {
    yearDiffText.value = formatDiffText(diff, "y");
    showYearDiff.value = true;

    const t = setTimeout(() => {
      yearDiffText.value = ""
      showYearDiff.value = false;
    }, 3500);

    diffTimeouts.push(t);
  }

  if (target === "month") {
    monthDiffText.value = formatDiffText(diff, "m");
    showMonthDiff.value = true;

    const t = setTimeout(() => {
      monthDiffText.value = ""
      showMonthDiff.value = false;
    }, 3500);

    diffTimeouts.push(t);
  }

  if (target === "day") {
    dayDiffText.value = formatDiffText(diff, "d");
    showDayDiff.value = true;

    const t = setTimeout(() => {
      dayDiffText.value = ""
      showDayDiff.value = false;
    }, 3500);

    diffTimeouts.push(t);
  }

  if (target === "hour") {
    hourDiffText.value = formatDiffText(diff, "h");
    showHourDiff.value = true;

    const t = setTimeout(() => {
      hourDiffText.value = ""
      showHourDiff.value = false;
    }, 3500);

    diffTimeouts.push(t);
  }

  if (target === "minute") {
    minuteDiffText.value = formatDiffText(diff, "min");
    showMinuteDiff.value = true;

    const t = setTimeout(() => {
      minuteDiffText.value = ""
      showMinuteDiff.value = false;
    }, 3500);

    diffTimeouts.push(t);
  }

  if (target === "second") {
    secondDiffText.value = formatDiffText(diff, "s");
    showSecondDiff.value = true;

    const t = setTimeout(() => {
      secondDiffText.value = ""
      showSecondDiff.value = false;
    }, 3500);

    diffTimeouts.push(t);
  }
}

function showChangedParts(diffMs: number) {
  console.log('diffMs', diffMs);

  if (!diffMs) return;

  const abs = Math.abs(diffMs);
  const sign = diffMs > 0 ? 1 : -1;

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  if (abs >= YEAR) {
    showDiff("year", sign * Math.round(abs / YEAR));
    return;
  }

  if (abs >= MONTH) {
    showDiff("month", sign * Math.round(abs / MONTH));
    return;
  }

  if (abs >= DAY) {
    showDiff("day", sign * Math.round(abs / DAY));
    return;
  }

  if (abs >= HOUR) {
    showDiff("hour", sign * Math.round(abs / HOUR));
    return;
  }

  if (abs >= MINUTE) {
    showDiff("minute", sign * Math.round(abs / MINUTE));
    return;
  }

  showDiff("second", sign * Math.round(abs / SECOND));
}
</script>

<template>
  <div class="flex rounded-md overflow-hidden w-full clock" style="gap:0.2rem">
    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="label overflow-hidden transition-all duration-500">
        <div v-if="isShowChange" class="diff-label" :style="{ visibility: yearDiffText ? 'visible' : 'hidden' }">{{
          yearDiffText || 0 }}</div>
        <span v-else>year</span>
      </div>
      <FlipClockItem :value="year" type="year" :spin="spinYear" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="label overflow-hidden transition-all duration-500">
        <div v-if="isShowChange" class="diff-label" :style="{ visibility: monthDiffText ? 'visible' : 'hidden' }">{{
          monthDiffText || 0 }}</div>
        <span v-else>month</span>
      </div>
      <FlipClockItem :value="month" type="month" :spin="spinMonth" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="label overflow-hidden transition-all duration-500">
        <div v-if="isShowChange" class="diff-label" :style="{ visibility: dayDiffText ? 'visible' : 'hidden' }">{{
          dayDiffText || 0 }}</div>
        <span v-else>day</span>
      </div>
      <FlipClockItem :value="day" type="day" :spin="spinDay" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="label overflow-hidden transition-all duration-500">
        <div v-if="isShowChange" class="diff-label" :style="{ visibility: hourDiffText ? 'visible' : 'hidden' }">{{
          hourDiffText || 0 }}</div>
        <span v-else>hour</span>
      </div>
      <FlipClockItem :value="hour" type="hour" :spin="spinHour" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="label overflow-hidden transition-all duration-500">
        <div v-if="isShowChange" class="diff-label" :style="{ visibility: minuteDiffText ? 'visible' : 'hidden' }">{{
          minuteDiffText || 0 }}</div>
        <span v-else>min</span>
      </div>
      <FlipClockItem :value="minute" type="minute" :spin="spinMinute" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="label overflow-hidden transition-all duration-500">
        <div v-if="isShowChange" class="diff-label" :style="{ visibility: secondDiffText ? 'visible' : 'hidden' }">{{
          secondDiffText || 0 }}</div>
        <span v-else>sec</span>
      </div>
      <FlipClockItem :scale-near="1" :value="second" type="second" :spin="spinSecond" />
    </div>
  </div>
</template>

<style scoped>
.clock {
  font-family: "Big Shoulders", sans-serif;
  font-size: 1.2rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #4D4D4D;
  font-weight: 700;
}

.label {
  font-weight: 500;
}

.diff-label {
  font-weight: 500;
  white-space: nowrap;
  color: var(--decline, #E32626);
}
</style>