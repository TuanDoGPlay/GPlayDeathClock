<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import Add from "@/assets/icons/add.svg";
import ButtonComponent from "@/components/button/ButtonComponent.vue";

const props = defineProps<{
  isShow: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const text = ref("");

watch(
    () => props.isShow,
    (open) => {
      if (open) text.value = "";
    }
);

const canSubmit = computed(() => text.value.trim().length > 0);

function close() {
  emit("close");
}

function submit() {
  const label = text.value.trim();
  if (!label) return;
  emit("close");
}
</script>
<template>
  <div
      :class="props.isShow ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'"
      class="w-full max-w-sm overflow-hidden rounded-2xl bg-white transition-all duration-300"
      @click.stop
  >
    <div class="p-5">
      <div class="rounded-2xl p-4 input-card flex items-center justify-center min-h-[120px]">
            <textarea
                v-model="text"
                class="block w-full resize-none bg-transparent text-center font-semibold outline-none"
                :rows="text.includes('\n') || text.length > 30 ? 3 : 1"
                placeholder="Nhập nội dung..."
                @keydown.esc.prevent="close"
                @keydown.enter.prevent="submit"
            />
      </div>

      <div class="mt-4 flex justify-center">
        <ButtonComponent
            :class="canSubmit ? '' : 'opacity-50 pointer-events-none'"
            :icon="Add"
            template="primary"
            text="Add"
            @click="submit"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-card {
  border-radius: 1rem;
  border: 0.1rem solid #C8C8C8;
  background: #F0F0F0;
}

/* Ẩn scrollbar của textarea nếu có để nhìn sạch hơn */
textarea::-webkit-scrollbar {
  display: none;
}
textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>