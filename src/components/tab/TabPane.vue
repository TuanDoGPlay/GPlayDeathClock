<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, getCurrentInstance, computed } from "vue";
import { TABS_KEY } from "./tabContext.ts";

const props = defineProps<{  name: string }>();

const ctx = inject(TABS_KEY);
if (!ctx) throw new Error("TabPane must be used inside TabComponent");

const uid = getCurrentInstance()!.uid;

onMounted(() => {
  ctx.registerPane({ uid, name: props.name, });
});
onBeforeUnmount(() => {
  ctx.unregisterPane(uid);
});

const isActive = computed(() => ctx.activeName.value === props.name);
</script>

<template>
  <!-- Khi swipe: phải luôn render để kéo ngang được -->
  <section
      class="min-w-full h-full snap-start snap-always overflow-y-auto"
      v-show="ctx.swipe.value ? true : isActive"
  >
    <slot />
  </section>
</template>
