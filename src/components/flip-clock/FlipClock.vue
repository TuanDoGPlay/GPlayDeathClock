<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import FlipClockItem from "@/components/flip-clock/FlipClockItem.vue";

const props = defineProps<{
  showLabel?: boolean
  value: number
}>()

const dateInstance = ref(new Date(props.value));

watch(() => props.value, () => {
  dateInstance.value = new Date(props.value);
})

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
  return (m + 1) + d / dim;
});

const year = computed(() => {
  return (dateInstance.value.getFullYear() % 100) + (month.value - 1) / 12;
});
</script>

<template>
  <div class="flex rounded-md overflow-hidden w-full clock" style="gap:0.2rem">
    <div class="item">
      <div
          :class="props.showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
          class="overflow-hidden transition-all duration-500"
      >
        <span>year</span>
      </div>
      <FlipClockItem :value="year" type="year"/>
    </div>

    <div class="item">
      <div
          :class="props.showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
          class="overflow-hidden transition-all duration-500"
      >
        <span>month</span>
      </div>
      <FlipClockItem :value="month" type="month"/>
    </div>

    <div class="item">
      <div
          :class="props.showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
          class="overflow-hidden transition-all duration-500"
      >
        <span>day</span>
      </div>
      <FlipClockItem :value="day" type="day"/>
    </div>

    <div class="item">
      <div
          :class="props.showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
          class="overflow-hidden transition-all duration-500"
      >
        <span>hour</span>
      </div>
      <FlipClockItem :value="hour" type="hour"/>
    </div>

    <div class="item">
      <div
          :class="props.showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
          class="overflow-hidden transition-all duration-500"
      >
        <span>min</span>
      </div>
      <FlipClockItem :value="minute" type="minute"/>
    </div>

    <div class="item">
      <div
          :class="props.showLabel ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'"
          class="overflow-hidden transition-all duration-500"
      >
        <span>sec</span>
      </div>
      <FlipClockItem :scale-near="1" :value="second" type="second"/>
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