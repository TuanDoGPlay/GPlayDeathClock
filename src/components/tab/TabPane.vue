<script lang="ts" setup>
import {
  inject,
  onBeforeUnmount,
  onMounted,
  getCurrentInstance,
  computed,
  ref,
} from "vue";
import { TABS_KEY } from "./tabContext.ts";

const props = defineProps<{ name: string }>();

const ctx = inject(TABS_KEY);
if (!ctx) throw new Error("TabPane must be used inside TabComponent");

const uid = getCurrentInstance()!.uid;

// ✅ thêm: bắt root element
const elRef = ref<HTMLElement | null>(null);

onMounted(() => {
  ctx.registerPane({
    uid,
    name: props.name,
    el: elRef.value, // ✅ thêm dòng này
  });
});

onBeforeUnmount(() => {
  ctx.unregisterPane(uid);
});

const isActive = computed(() => ctx.activeName.value === props.name);
</script>

<template>
  <section ref="elRef" class="min-w-full h-full snap-start snap-always overflow-y-auto"
    v-show="ctx.swipe.value ? true : isActive">
    <slot />
  </section>
</template>