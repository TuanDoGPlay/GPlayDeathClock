<script lang="ts" setup>
import { computed, ref, watch, onBeforeUnmount, onMounted } from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";
import { EventEnum } from "@/constants/events";
import { CommonController } from "@/common/controller";

const props = defineProps<{
  showLabel?: boolean;
  value: number;
}>();

const isSpin = ref(false);
const isShowChange = ref(false);
const isCanTick = ref(true);

// ✅ Tạo các biến trạng thái spin độc lập cho từng cột
const spinYear = ref(isSpin.value);
const spinMonth = ref(isSpin.value);
const spinDay = ref(isSpin.value);
const spinHour = ref(isSpin.value);
const spinMinute = ref(isSpin.value);
const spinSecond = ref(isSpin.value);


const time = ref(props.value)
const dateInstance = computed(() => {
  return new Date(time.value)
});
const differenceTime = ref(0)

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

onMounted(() => {
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
  () => props.value,
  (oldVal, newVal) => {
    differenceTime.value = newVal - oldVal
    time.value = newVal;
  }
);

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

});




async function fetchRemainLiveTime() {
  time.value = await CommonController.getRemainLiveTime();
}

function clearStaggeredTimeouts() {
  stopTimeouts.forEach(clearTimeout);
  stopTimeouts = [];
}

</script>

<template>
  <div class="flex rounded-md overflow-hidden w-full clock" style="gap:0.2rem">
    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="overflow-hidden transition-all duration-500">
        <span>year</span>
      </div>
      <FlipClockItem :value="year" type="year" :spin="spinYear" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="overflow-hidden transition-all duration-500">
        <span>month</span>
      </div>
      <FlipClockItem :value="month" type="month" :spin="spinMonth" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="overflow-hidden transition-all duration-500">
        <span>day</span>
      </div>
      <FlipClockItem :value="day" type="day" :spin="spinDay" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="overflow-hidden transition-all duration-500">
        <span>hour</span>
      </div>
      <FlipClockItem :value="hour" type="hour" :spin="spinHour" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="overflow-hidden transition-all duration-500">
        <span>min</span>
      </div>
      <FlipClockItem :value="minute" type="minute" :spin="spinMinute" />
    </div>

    <div class="item">
      <div :class="showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
        class="overflow-hidden transition-all duration-500">
        <span>sec</span>
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
</style>