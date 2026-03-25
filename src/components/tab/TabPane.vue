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
const elRef = ref<HTMLElement | null>(null);

onMounted(() => {
  ctx.registerPane({
    uid,
    name: props.name,
    el: elRef.value,
  });
});

onBeforeUnmount(() => {
  ctx.unregisterPane(uid);
});
</script>

<template>
  <section
      ref="elRef"
      class="min-w-full h-full snap-start snap-always overflow-y-auto"
  >
    <slot />
  </section>
</template>