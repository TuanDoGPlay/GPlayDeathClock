<script lang="ts" setup>
import Share from '@/assets/icons/share.svg'
import ContentFrame from "@/screens/home/components/ContentFrame.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import {Swiper, SwiperSlide} from "swiper/vue";
import {EffectCoverflow} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import {onMounted, ref} from "vue";
import {type ShareTemplate, Utils} from "@/common/utils.ts";

const emit = defineEmits<{
  (e: "select", id: number): void;
}>();

const templates = ref<ShareTemplate[]>([])

const activeIndex = ref(0);

onMounted(() => {
  templates.value = Utils.getAllShareTemplates()
})

const onSlideChange = (swiper: any) => {
  activeIndex.value = swiper.realIndex;
};

function onSelect() {
  const selectedTemplate = templates.value[activeIndex.value];
  if (!selectedTemplate) {
    return;
  }
  emit('select', selectedTemplate.id);
}
</script>

<template>
  <ContentFrame :icon="Share" title="Share Clock">
    <div class="flex flex-col items-center justify-center h-full pb-2 overflow-hidden">
      <p class="font-semibold my-4">{{ templates[activeIndex]?.title }}</p>
      <Swiper
          :centeredSlides="true"
          :coverflowEffect="{
            rotate: 0,
            stretch: -50,
            depth: 160,
            modifier: 1.1,
            slideShadows: false
          }"
          :grabCursor="true"
          :modules="[EffectCoverflow]"
          :slideToClickedSlide="true"
          :speed="450"
          class="share-swiper w-full h-full"
          effect="coverflow"
          slidesPerView="auto"
          @slideChange="onSlideChange"
      >
        <SwiperSlide v-for="item in templates" class="card-slide">
          <div class="card">
            <img :src="item.image" alt=""/>
          </div>
        </SwiperSlide>
      </Swiper>
      <ButtonComponent class="mt-3" style="width: 50%" template="primary" text="Use this" @click="onSelect"/>
    </div>
  </ContentFrame>
</template>

<style scoped>
:deep(.share-swiper),
:deep(.share-swiper .swiper-wrapper),
:deep(.share-swiper .swiper-slide) {
  overflow: visible !important;
}

:deep(.share-swiper .swiper-slide.card-slide) {
  width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform;
  transition: transform 450ms ease;
}

.card {
  width: 100%;
  will-change: transform, opacity;
  transition: transform 450ms ease,
  opacity 450ms ease;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

:deep(.share-swiper .swiper-slide-active .card) {
  transform: scale(1.08);
}

:deep(.share-swiper .swiper-slide-prev .card),
:deep(.share-swiper .swiper-slide-next .card) {
  opacity: 0.75;
  transform: translateY(18px) scale(0.75);
}
</style>