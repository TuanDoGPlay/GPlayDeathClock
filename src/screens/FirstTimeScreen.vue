<script lang="ts" setup>
import {onMounted} from "vue";

const lines = Array.from({length: 20});

</script>

<template>
  <div class="road-wrapper fixed inset-0 z-50 overflow-hidden">
    <img alt="way" class="h-full w-full object-cover" src="/way.svg">
    <div class="white-line left-2"></div>
    <div class="white-line right-2"></div>
    <div class="absolute inset-0 flex flex-col items-center road-animation">
      <div v-for="(_, index) in lines" :key="index" class="lane-line"></div>
    </div>

    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div class="mx-2 mb-20">

      </div>
      <div class="text-center px-10">
        <h2 class="text">
          How much time<br>do you have left?
        </h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.road-wrapper {
  height: 100vh;
  width: 100vw;
}

/* Container chứa các vạch kẻ thực hiện chuyển động tịnh tiến */
.road-animation {
  /* Khoảng cách giữa các vạch kẻ (gap) */
  gap: 4rem;
  padding-top: 2rem;
  /* Animation: tên - thời gian - kiểu chạy (đều) - lặp vô tận */
  animation: scroll-down 1.2s linear infinite;
}

.lane-line {
  width: 1rem;
  height: 5rem;
  opacity: 0.4;
  background: #D8A721;
  border-radius: 0.2rem;
  flex-shrink: 0;
  /* Hiệu ứng bóng đổ nhẹ cho giống vạch sơn trên đường */
  box-shadow: 0 0 15px rgba(216, 167, 33, 0.4);
}

/* Logic: Di chuyển một khoảng đúng bằng chiều cao vạch + gap rồi reset */
@keyframes scroll-down {
  0% {
    transform: translateY(-9rem); /* (7rem chiều cao + 4rem gap) */
  }
  100% {
    transform: translateY(0);
  }
}

/* Làm chữ sắc nét hơn trên nền tối */
.text {
  color: #E4E4E4;
  font-weight: 700;
  line-height: 1.2;
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.2rem;
}

.white-line {
  height: 100%;
  width: 0.75rem;
  background-color: var(--panel-theme-1);
  position: absolute;
  top: 0;
}
</style>