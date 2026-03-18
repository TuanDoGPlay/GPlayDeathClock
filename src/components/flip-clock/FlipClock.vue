<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";
import { EventEnum } from "@/constants/events";
import { CommonController } from "@/common/controller";
import type { ReverseClockView } from "@/common/types";
import { MS_IN_DAY, MS_IN_HOUR, MS_IN_MINUTE, MS_IN_MONTH, MS_IN_SECOND, MS_IN_YEAR, Utils } from "@/common/utils";

interface UnitConfig {
  key: keyof ReverseClockView;
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

// Thứ tự ưu tiên từ nhỏ đến lớn để xác định cột nào "bị tác động"
const UNIT_ORDER: (keyof ReverseClockView)[] = ["second", "minute", "hour", "day", "month", "year"];

const props = defineProps<{
  showLabel?: boolean;
  value?: number;
  hideAnimation?: boolean;
  animationDuration?: number;
}>();

const totalAnimTime = computed(() => props.animationDuration ?? 1000);
const isCanTick = ref(true);
const time = ref(0);

const spinSpeeds = ref<Record<string, number>>({
  year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0
});

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
const bumpStates = ref<Record<string, boolean>>({
  year: false, month: false, day: false, hour: false, minute: false, second: false
});
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

let stopTimeouts: any[] = [];
let restoreTimeout: any = null;

function handleTimeChange(targetKey: keyof ReverseClockView) {
  stopTimeouts.forEach(clearTimeout);
  stopTimeouts = [];
  if (restoreTimeout) clearTimeout(restoreTimeout);

  hideLabels.value = true;
  const targetIdx = UNIT_ORDER.indexOf(targetKey);

  // 1. Phân bổ Spin: Cột chính 0 spin, cột sau càng nhỏ spin càng nhanh
  UNITS.forEach((u) => {
    const unitIdx = UNIT_ORDER.indexOf(u.key);
    diffTexts.value[u.key] = ""; // Reset diff cũ

    if (unitIdx < targetIdx) {
      // CỘT NHỎ HƠN: Cho xoay tít
      spinStates.value[u.key] = true;
      // Công thức: Càng xa cột chính (về phía Second) càng nhanh
      spinSpeeds.value[u.key] = 20 + (targetIdx - unitIdx) * 60;
    } else if (unitIdx == targetIdx) {
      spinStates.value[u.key] = true;
      spinSpeeds.value[u.key] = 1;
    } else {
      // CỘT CHÍNH & CỘT LỚN HƠN: Không spin (0 vòng)
      spinStates.value[u.key] = false;
      spinSpeeds.value[u.key];
    }
  });
  console.log(spinSpeeds.value);

  // 2. Mốc thời gian dừng ĐỒNG LOẠT
  const stopAt = totalAnimTime.value;

  const tFinish = setTimeout(() => {
    // Dừng tất cả các cột đang xoay
    UNITS.forEach(u => (spinStates.value[u.key] = false));

    // HIỆN DIFF NGAY LẬP TỨC KHI DỪNG
    UNITS.forEach(u => {
      if (pendingDiffTexts.value[u.key]) {
        diffTexts.value[u.key] = pendingDiffTexts.value[u.key]!;
        pendingDiffTexts.value[u.key] = "";
      }
    });

    // Kích hoạt đếm ngược để hồi phục nhãn tên (Label)
    isCanTick.value = true;
    startRestoreTimer();

  }, stopAt);

  stopTimeouts.push(tFinish);
}

function startRestoreTimer() {
  if (restoreTimeout) clearTimeout(restoreTimeout);

  restoreTimeout = setTimeout(() => {
    // NHỊP QUYẾT ĐỊNH: Xóa Diff và tắt hideLabels trong cùng 1 tick
    UNITS.forEach(u => {
      diffTexts.value[u.key] = "";
    });

    // Khi hideLabels = false, tất cả cột không có Diff sẽ hiện lại Unit Name cùng lúc
    hideLabels.value = false;

  }, 1000);
}

function showChangedParts(diffMs: number): keyof ReverseClockView {
  const abs = Math.abs(diffMs);
  if (abs < 1000) return "second";

  const sign = diffMs > 0 ? "+" : "-";
  const thresholds = [
    { key: "year", val: MS_IN_YEAR },
    { key: "month", val: MS_IN_MONTH },
    { key: "day", val: MS_IN_DAY },
    { key: "hour", val: MS_IN_HOUR },
    { key: "minute", val: MS_IN_MINUTE },
    { key: "second", val: MS_IN_SECOND }
  ] as const;

  // Dòng 148 sửa thành:
  const target = (thresholds.find(t => abs >= t.val) || thresholds[thresholds.length - 1])!;

  // Bây giờ các dòng dưới sẽ không còn báo lỗi nữa
  const diffVal = Math.floor(abs / target.val);
  const unitInfo = UNITS.find(u => u.key === target.key);

  UNITS.forEach(u => pendingDiffTexts.value[u.key] = "");
  pendingDiffTexts.value[target.key] = `${sign}${diffVal}${unitInfo?.short || ''}`;

  return target.key as keyof ReverseClockView;
}

// Hàm cập nhật chung
async function processUpdate(newTime: number) {
  const prev = time.value;
  if (props.hideAnimation || prev == 0) {
    time.value = newTime;
    return;
  }

  isCanTick.value = false;
  time.value = newTime;
  const targetKey = showChangedParts(newTime - prev);
  handleTimeChange(targetKey);
}

onMounted(async () => {
  // Lấy thời gian ban đầu
  const initial = props.value ?? await CommonController.getRemainLiveTime();
  time.value = initial;

  // Timer chạy ngầm
  const timer = setInterval(() => {
    if (isCanTick.value) time.value -= 1000;
  }, 1000);

  // Lắng nghe sự kiện bên ngoài
  const onTimeChange = async () => {
    const next = await CommonController.getRemainLiveTime();
    processUpdate(next);
  };

  document.addEventListener(EventEnum.ChangeTime, onTimeChange);

  onBeforeUnmount(() => {
    clearInterval(timer);
    document.removeEventListener(EventEnum.ChangeTime, onTimeChange);
  });
});

watch(() => unitValues.value.second, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // Bật hiệu ứng rung cho phút và giờ (có thể thêm các cột khác nếu muốn)
    bumpStates.value.minute = true;
    bumpStates.value.hour = true;

    // Tắt trạng thái rung sau 150ms (khớp với thời gian CSS animation)
    setTimeout(() => {
      bumpStates.value.minute = false;
      bumpStates.value.hour = false;
    }, 150);
  }
});

watch(() => props.value, (newVal) => {
  if (newVal !== undefined && newVal !== null) processUpdate(newVal);
});
</script>

<template>
  <div class="clock-container">
    <div v-for="u in UNITS" :key="u.key" class="item">
      <div v-if="props.showLabel" class="label-wrapper">
        <Transition name="diff-float" mode="out-in">
          <!-- Hiển thị Diff nếu có -->
          <div v-if="diffTexts[u.key]" :key="u.key + 'diff'" class="diff-label"
            :style="{ color: diffTexts[u.key]?.startsWith('+') ? '#66BC32' : '#E32626' }">
            {{ diffTexts[u.key] }}
          </div>

          <!-- Hiển thị Label mặc định nếu không quay -->
          <span v-else-if="!hideLabels" :key="u.key + 'label'" class="unit-name">
            {{ u.label }}
          </span>

          <!-- Giữ chỗ khi đang quay -->
          <div v-else :key="u.key + 'empty'" class="empty-holder"></div>
        </Transition>
      </div>

      <FlipClockItem :spin="spinStates[u.key]" :spinSpeed="spinSpeeds[u.key]" :type="u.key" :value="unitValues[u.key]"
        :class="{
          'is-bumping': bumpStates[u.key],
          [`bump-${u.key}`]: true
        }" />
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

/* --- HIỆU ỨNG RUNG GIẬT MẠNH DẦN --- */

/* 1. Định nghĩa cường độ giật cho từng kim (tăng dần từ Year -> Minute) */
.bump-minute {
  --shake-intensity: 4px;
}

.bump-hour {
  --shake-intensity: 3px;
}

.bump-day {
  --shake-intensity: 2px;
}

.bump-month {
  --shake-intensity: 1px;
}

.bump-year {
  --shake-intensity: 0.5px;
}

/* 2. Class kích hoạt animation */
.is-bumping {
  animation: quick-shake-graduated 0.15s ease-out;
}

/* 3. Animation dùng biến CSS tính toán biên độ nảy */
@keyframes quick-shake-graduated {
  0% {
    transform: translateY(0);
  }

  25% {
    transform: translateY(calc(-1 * var(--shake-intensity)));
  }

  /* Nảy lên */
  50% {
    transform: translateY(calc(0.6 * var(--shake-intensity)));
  }

  /* Trì xuống */
  75% {
    transform: translateY(calc(-0.2 * var(--shake-intensity)));
  }

  /* Nảy lên nhẹ */
  100% {
    transform: translateY(0);
  }
}
</style>