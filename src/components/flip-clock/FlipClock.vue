<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";

const now = ref(new Date());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 500);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

/* ===== TÍNH GIÁ TRỊ DẠNG FLOAT (TRUYỀN ĐỘNG) ===== */

const second = computed(() => {
  const s = now.value.getSeconds();
  const ms = now.value.getMilliseconds();

  // Chia 1000 để lấy phần thập phân, sau đó toFixed(1) để lấy 1 chữ số
  // Kết quả sẽ là 3.0, 3.1, ..., 3.5...
  return parseFloat((s + ms / 1000).toFixed(1));
});

const minute = computed(() => {
  return now.value.getMinutes() + second.value / 60;
});

const hour = computed(() => {
  return (now.value.getHours() % 24) + minute.value / 60;
});

const day = computed(() => {
  return now.value.getDate() + hour.value / 24;
});

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const month = computed(() => {
  const m = now.value.getMonth(); // 0-11
  const d = now.value.getDate() - 1 + hour.value / 24;
  const dim = daysInMonth(now.value.getFullYear(), m);
  return (m + 1) + d / dim;
});

const year = computed(() => {
  return (now.value.getFullYear() % 100) + (month.value - 1) / 12;
});
</script>

<template>
  <div class="flex rounded-md overflow-hidden w-fit clock" style="gap:0.2rem">
    <div class="item">
      <span>year</span>
      <FlipClockItem :value="year" type="year"/>
    </div>

    <div class="item">
      <span>month</span>
      <FlipClockItem :value="month" type="month"/>
    </div>

    <div class="item">
      <span>day</span>
      <FlipClockItem :value="day" type="day"/>
    </div>

    <div class="item">
      <span>hour</span>
      <FlipClockItem :value="hour" type="hour"/>
    </div>

    <div class="item">
      <span>min</span>
      <FlipClockItem :value="minute" type="minute"/>
    </div>

    <div class="item">
      <span>sec</span>
      <FlipClockItem :value="second" type="second"/>
    </div>
  </div>
</template>

<style scoped>
.clock {
  font-family: "Big Shoulders", sans-serif;
  font-size: 1.2rem;
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