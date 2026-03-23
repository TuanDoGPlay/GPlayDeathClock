<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";
import { EventEnum } from "@/constants/events";
import { CommonController } from "@/common/controller";
import type { ReverseClockView } from "@/common/types";
import {
  MS_IN_DAY,
  MS_IN_HOUR,
  MS_IN_MINUTE,
  MS_IN_MONTH,
  MS_IN_SECOND,
  MS_IN_YEAR,
  Utils,
} from "@/common/utils";
import { NativeAudio } from "@capgo/native-audio";

interface UnitConfig {
  key: keyof ReverseClockView;
  label: string;
  short: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const UNITS: UnitConfig[] = [
  { key: "year", label: "year", short: "y" },
  { key: "month", label: "month", short: "mon" },
  { key: "day", label: "day", short: "d" },
  { key: "hour", label: "hour", short: "h" },
  { key: "minute", label: "min", short: "min" },
  { key: "second", label: "sec", short: "s" },
];

const UNIT_ORDER: (keyof ReverseClockView)[] = [
  "second", "minute", "hour", "day", "month", "year",
];

const THRESHOLDS = [
  { key: "year", val: MS_IN_YEAR },
  { key: "month", val: MS_IN_MONTH },
  { key: "day", val: MS_IN_DAY },
  { key: "hour", val: MS_IN_HOUR },
  { key: "minute", val: MS_IN_MINUTE },
  { key: "second", val: MS_IN_SECOND },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{
  showLabel?: boolean;
  value?: number;
  hideAnimation?: boolean;
  animationDuration?: number;
  playSound?: boolean
}>();

// ─── State ────────────────────────────────────────────────────────────────────

const totalAnimTime = computed(() => props.animationDuration ?? 1500);
const isCanTick = ref(true);
const time = ref(0);

const spinDirection = ref<"forward" | "backward">("backward");

const spinTurn = ref<Record<string, number>>({
  year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0,
});
const spinStates = ref<Record<string, boolean>>({
  year: false, month: false, day: false, hour: false, minute: false, second: false,
});
const diffTexts = ref<Record<string, string>>({
  year: "", month: "", day: "", hour: "", minute: "", second: "",
});
const pendingDiffTexts = ref<Record<string, string>>({
  year: "", month: "", day: "", hour: "", minute: "", second: "",
});
const hideLabels = ref(false);

// ─── Computed ─────────────────────────────────────────────────────────────────

const unitValues = computed((): ReverseClockView => {
  const t = time.value;
  return {
    year: Utils.formatNumber(t / MS_IN_YEAR, 0),
    month: Utils.formatNumber((t % MS_IN_YEAR) / MS_IN_MONTH, 0),
    day: Utils.formatNumber((t % MS_IN_MONTH) / MS_IN_DAY, 0),
    hour: Utils.formatNumber((t % MS_IN_DAY) / MS_IN_HOUR, 0),
    minute: Utils.formatNumber((t % MS_IN_DAY % MS_IN_HOUR) / MS_IN_MINUTE, 0),
    second: Utils.formatNumber((t % MS_IN_MINUTE) / MS_IN_SECOND, 0),
  };
});

// ─── Timers ───────────────────────────────────────────────────────────────────

let stopTimeouts: ReturnType<typeof setTimeout>[] = [];
let restoreTimeout: ReturnType<typeof setTimeout> | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let onTimeChangeHandler: (() => Promise<void>) | null = null;

// ─── Animation logic ──────────────────────────────────────────────────────────

function handleTimeChange(targetKey: keyof ReverseClockView) {
  stopTimeouts.forEach(clearTimeout);
  stopTimeouts = [];
  if (restoreTimeout) {
    clearTimeout(restoreTimeout);
    restoreTimeout = null;
  }

  hideLabels.value = true;
  const targetIdx = UNIT_ORDER.indexOf(targetKey);

  const spinValues = [1, 3, 5, 10, 15];

  UNITS.forEach((u) => {
    const unitIdx = UNIT_ORDER.indexOf(u.key);
    diffTexts.value[u.key] = "";

    // Tính khoảng cách (càng xa targetIdx, số vòng xoay càng lớn)
    const distance = targetIdx - unitIdx;

    if (unitIdx < targetIdx) {
      spinStates.value[u.key] = true;
      const arrayIdx = Math.min(distance - 1, spinValues.length - 1);
      spinTurn.value[u.key] = spinValues[arrayIdx];
    } else if (unitIdx === targetIdx) {
      spinStates.value[u.key] = true;
      spinTurn.value[u.key] = 0;
    } else {
      spinStates.value[u.key] = true;
      spinTurn.value[u.key] = 0;
    }
  });

  const tFinish = setTimeout(() => {
    UNITS.forEach((u) => (spinStates.value[u.key] = false));

    UNITS.forEach((u) => {
      if (pendingDiffTexts.value[u.key]) {
        diffTexts.value[u.key] = pendingDiffTexts.value[u.key];
        pendingDiffTexts.value[u.key] = "";
      }
    });

    setTimeout(() => {
      isCanTick.value = true;
    }, 500)
    startRestoreTimer();
  }, totalAnimTime.value);

  stopTimeouts.push(tFinish);
}

function startRestoreTimer() {
  if (restoreTimeout) clearTimeout(restoreTimeout);

  restoreTimeout = setTimeout(() => {
    UNITS.forEach((u) => (diffTexts.value[u.key] = ""));
    hideLabels.value = false;
  }, 1000);
}

function showChangedParts(diffMs: number): keyof ReverseClockView {
  const abs = Math.abs(diffMs);
  const sign = diffMs > 0 ? "+" : "-";

  const target = THRESHOLDS.find((t) => abs >= t.val) ?? THRESHOLDS[THRESHOLDS.length - 1];
  let diffVal = Math.round(abs / target.val);
  let unitInfo = UNITS.find((u) => u.key === target.key);
  let finalTarget = target;

  // Nếu round lên bằng đúng 1 đơn vị lớn hơn thì đổi sang đơn vị đó
  const currentIdx = THRESHOLDS.findIndex((t) => t.key === target.key);
  if (currentIdx > 0) {
    const upperThreshold = THRESHOLDS[currentIdx - 1];
    if (diffVal * target.val >= upperThreshold.val) {
      finalTarget = upperThreshold;
      diffVal = Math.round(abs / upperThreshold.val);
      unitInfo = UNITS.find((u) => u.key === upperThreshold.key);
    }
  }

  UNITS.forEach((u) => (pendingDiffTexts.value[u.key] = ""));
  pendingDiffTexts.value[finalTarget.key] = `${sign}${diffVal}${unitInfo?.short ?? ""}`;

  return finalTarget.key as keyof ReverseClockView;
}

// ─── Update entry point ───────────────────────────────────────────────────────

async function processUpdate(newTime: number) {
  const prev = time.value;
  if (props.hideAnimation || prev === 0) {
    time.value = newTime;
    return;
  }

  isCanTick.value = false;
  time.value = newTime;
  spinDirection.value = newTime - prev > 0 ? "forward" : "backward";

  const targetKey = showChangedParts(newTime - prev);
  handleTimeChange(targetKey);
}

onMounted(async () => {
  const initial = props.value ?? (await CommonController.getRemainLiveTime());
  time.value = initial;
  try {
    await NativeAudio.preload({
      assetId: 'clock',
      assetPath: 'sounds/clock.mp3',
      isUrl: false,
    });
  } catch (error) {
    console.log('Audio already preloaded or error:', error);
  }
  tickInterval = setInterval(() => {
    if (isCanTick.value && time.value > 0) {
      time.value -= 1000;
      if (props.playSound) {
        NativeAudio.play({
          assetId: 'clock',
        });
      }
    }
  }, 1000);
  onTimeChangeHandler = async () => {
    console.log('on change time');

    const next = await CommonController.getRemainLiveTime();
    processUpdate(next);
  };

  document.addEventListener(EventEnum.ChangeTime, onTimeChangeHandler);
});

onBeforeUnmount(() => {
  if (tickInterval) clearInterval(tickInterval);
  if (restoreTimeout) clearTimeout(restoreTimeout);
  stopTimeouts.forEach(clearTimeout);
  if (onTimeChangeHandler) {
    document.removeEventListener(EventEnum.ChangeTime, onTimeChangeHandler);
  }
});

watch(() => props.playSound, (isPlay) => {
  if (!isPlay) {
    NativeAudio.stop({ assetId: 'clock' });
  }
});

watch(
  () => props.value,
  (newVal) => {
    if (newVal !== undefined && newVal !== null) processUpdate(newVal);
  }
);
</script>

<template>
  <div class="clock-container">
    <div v-for="u in UNITS" :key="u.key" class="item">
      <div v-if="props.showLabel" class="label-wrapper">
        <Transition name="diff-float" mode="out-in">
          <div v-if="diffTexts[u.key]" :key="u.key + 'diff'" class="diff-label"
            :style="{ color: diffTexts[u.key]?.startsWith('+') ? '#66BC32' : '#E32626' }">
            {{ diffTexts[u.key] }}
          </div>

          <span v-else-if="!hideLabels" :key="u.key + 'label'" class="unit-name">
            {{ u.label }}
          </span>

          <div v-else :key="u.key + 'empty'" class="empty-holder" />
        </Transition>
      </div>

      <FlipClockItem :spin="spinStates[u.key]" :spinTurn="spinTurn[u.key]" :spinDirection="spinDirection"
        :duration="totalAnimTime" :type="u.key" :value="unitValues[u.key]" />
    </div>
  </div>
</template>

<style scoped>
.clock-container {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.2rem;
  font-family: "Big Shoulders", sans-serif;
  border-radius: 0.5rem;
  overflow: hidden;
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
  color: #4d4d4d;
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

/* ─── Diff float transition ─────────────────────────────────────────────────── */

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