<script lang="ts" setup>
import { computed, ref, onBeforeUnmount, onMounted } from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";
import { EventEnum } from "@/constants/events";
import { CommonController } from "@/common/controller";

interface UnitConfig {
  key: "year" | "month" | "day" | "hour" | "minute" | "second";
  label: string;
  short: string;
}

const UNITS: UnitConfig[] = [
  { key: "year", label: "year", short: "y" },
  { key: "month", label: "month", short: "m" },
  { key: "day", label: "day", short: "d" },
  { key: "hour", label: "hour", short: "h" },
  { key: "minute", label: "min", short: "min" },
  { key: "second", label: "sec", short: "s" },
];

const UNIT_ORDER = ["second", "minute", "hour", "day", "month", "year"];

const props = defineProps<{ showLabel?: boolean }>();

const isCanTick = ref(true);
const time = ref(0);

const hideLabels = ref(false);
const spinStates = ref<Record<string, boolean>>({
  year: false, month: false, day: false, hour: false, minute: false, second: false
});
const diffTexts = ref<Record<string, string>>({
  year: "", month: "", day: "", hour: "", minute: "", second: ""
});
const pendingDiffTexts = ref<Record<string, string>>({
  year: "", month: "", day: "", hour: "", minute: "", second: ""
});

const dateInstance = computed(() => new Date(time.value));
const secondVal = computed(() => parseFloat((dateInstance.value.getSeconds() + dateInstance.value.getMilliseconds() / 1000).toFixed(0)));
const minuteVal = computed(() => dateInstance.value.getMinutes() + secondVal.value / 60);
const hourVal = computed(() => (dateInstance.value.getHours() % 24) + minuteVal.value / 60);
const dayVal = computed(() => dateInstance.value.getDate() + hourVal.value / 24);
const monthVal = computed(() => {
  const m = dateInstance.value.getMonth();
  const d = dateInstance.value.getDate() - 1 + hourVal.value / 24;
  const dim = new Date(dateInstance.value.getFullYear(), m + 1, 0).getDate();
  return m + 1 + d / dim;
});
const yearVal = computed(() => (dateInstance.value.getFullYear() % 100) + (monthVal.value - 1) / 12);

const unitValues = computed(() => ({
  year: yearVal.value,
  month: monthVal.value,
  day: dayVal.value,
  hour: hourVal.value,
  minute: minuteVal.value,
  second: secondVal.value
}));

let stopTimeouts: any[] = [];
let restoreTimeout: any = null;

function handleTimeChange(targetKey: string) {
  stopTimeouts.forEach(clearTimeout);
  stopTimeouts = [];

  const targetIndex = UNIT_ORDER.indexOf(targetKey);

  hideLabels.value = true;

  // Reset trạng thái text và spin
  UNITS.forEach(u => {
    diffTexts.value[u.key] = "";
    spinStates.value[u.key] = false;
  });

  // Bật xoay (spin = true) cho cột bị thay đổi và các cột nhỏ hơn
  for (let i = 0; i <= targetIndex; i++) {
    spinStates.value[UNIT_ORDER[i]] = true;
  }

  // Tắt xoay lần lượt từ second -> targetKey
  for (let i = 0; i <= targetIndex; i++) {
    const key = UNIT_ORDER[i];
    const stopTime = i * 500;

    stopTimeouts.push(setTimeout(() => {
      spinStates.value[key] = false;

      stopTimeouts.push(setTimeout(() => {
        checkAndShowDiff(key);

        // KHI CỘT CUỐI CÙNG XOAY XONG -> MỞ KHÓA TIME
        if (i === targetIndex) {
          startRestoreTimer();
          stopTimeouts.push(setTimeout(() => {
            isCanTick.value = true; // Cho phép đếm ngược trở lại
          }, 500));
        }
      }, 400));

    }, stopTime));
  }
}

function checkAndShowDiff(key: string) {
  if (pendingDiffTexts.value[key]) {
    diffTexts.value[key] = pendingDiffTexts.value[key];
    pendingDiffTexts.value[key] = "";
  }
}

function startRestoreTimer() {
  if (restoreTimeout) clearTimeout(restoreTimeout);
  restoreTimeout = setTimeout(() => {
    UNITS.forEach(u => diffTexts.value[u.key] = "");
    setTimeout(() => {
      hideLabels.value = false;
    }, 400);
  }, 1000);
}

function showChangedParts(diffMs: number): string {
  if (!diffMs) return "second";
  const abs = Math.abs(diffMs);
  const sign = diffMs > 0 ? "+" : "-";
  const thresholds = [
    { key: "year", val: 31536000000 }, { key: "month", val: 2592000000 },
    { key: "day", val: 864000000 }, { key: "hour", val: 3600000 },
    { key: "minute", val: 60000 }, { key: "second", val: 1000 }
  ];

  const target = thresholds.find(t => abs >= t.val) || thresholds[5];
  const diffVal = Math.round(abs / target.val);
  const unitInfo = UNITS.find(u => u.key === target.key);

  UNITS.forEach(u => pendingDiffTexts.value[u.key] = "");
  if (diffVal !== 0) {
    pendingDiffTexts.value[target.key] = `${sign}${diffVal}${unitInfo?.short}`;
  }

  return target.key;
}

onMounted(async () => {
  time.value = await CommonController.getRemainLiveTime();
  console.log('time', time.value);

  const timer = setInterval(() => {
    if (isCanTick.value) {
      time.value -= 1000;
    }
  }, 1000);

  document.addEventListener(EventEnum.ChangeTime, async () => {
    // KHÓA TIME NGAY LẬP TỨC khi có lệnh đổi (không trừ time nữa)
    isCanTick.value = false;

    const prev = time.value;
    const next = await CommonController.getRemainLiveTime();
    time.value = next; // Update time mới cố định

    const targetKey = showChangedParts(next - prev);
    handleTimeChange(targetKey);
  });

  onBeforeUnmount(() => clearInterval(timer));
});

onBeforeUnmount(() => {
  stopTimeouts.forEach(clearTimeout);
  clearTimeout(restoreTimeout);
});
</script>

<template>
  <div class="clock-container">
    <div v-for="u in UNITS" :key="u.key" class="item">
      <div class="label-wrapper" :style="{ opacity: showLabel ? 1 : 0 }">

        <Transition name="diff-float">
          <div v-if="diffTexts[u.key]" :key="u.key + 'diff'" class="diff-label"
            :style="{ color: diffTexts[u.key].startsWith('+') ? '#66BC32' : '#E32626' }">
            {{ diffTexts[u.key] }}
          </div>

          <span v-else-if="!hideLabels" :key="u.key + 'label'" class="unit-name">
            {{ u.label }}
          </span>

          <div v-else :key="u.key + 'empty'" class="empty-holder"></div>
        </Transition>

      </div>

      <FlipClockItem :value="unitValues[u.key]" :type="u.key" :spin="spinStates[u.key]" />
    </div>
  </div>
</template>

<style scoped>
.clock-container {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.2rem;
  font-family: "Big Shoulders", sans-serif;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.label-wrapper {
  height: 1.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.unit-name,
.diff-label,
.empty-holder {
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
  white-space: nowrap;
}

.unit-name {
  color: #4D4D4D;
  font-weight: 500;
  font-size: 1.2rem;
}

.diff-label {
  font-weight: 800;
  font-size: 1rem;
}

.empty-holder {
  height: 1px;
  width: 1px;
}

/* ANIMATION */
.diff-float-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.diff-float-leave-active {
  transition: all 0.4s ease-in;
}

.diff-float-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.diff-float-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>