<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import Add from "@/assets/icons/add.svg";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import {CommonController} from "@/common/controller.ts";

const props = defineProps<{
  isShow: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit"): void;
}>();

const text = ref("");
const editableRef = ref<HTMLDivElement | null>(null);
const canSubmit = computed(() => text.value.trim().length > 0);

watch(
    () => props.isShow,
    (open) => {
      if (open) {
        text.value = "";
        // Reset nội dung hiển thị trong div
        if (editableRef.value) editableRef.value.innerText = "";
      }
    }
);


function handleInput(e: Event) {
  const target = e.target as HTMLDivElement;
  text.value = target.innerText;
}

function handleClose() {
  emit("close");
}

async function handleSubmit() {
  if (!canSubmit.value) return;
  await CommonController.createBucketItem(text.value.trim())
  emit("submit");
  handleClose()
}

// Hàm xử lý phím tắt
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
  if (e.key === "Escape") {
    e.preventDefault();
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
          v-if="props.isShow"
          class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          @click="handleClose"
      >
        <div
            :class="props.isShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
            class="w-full max-w-sm overflow-hidden rounded-2xl bg-white transition-all duration-300"
            @click.stop
        >
          <div class="p-5">
            <div class="rounded-2xl p-4 input-card flex items-center justify-center min-h-[120px]">
              <div
                  ref="editableRef"
                  :data-placeholder="text.length === 0 ? 'Input...' : ''"
                  class="editable-area block w-full bg-transparent text-center font-semibold outline-none text-gray-800"
                  contenteditable="true"
                  role="textbox"
                  @input="handleInput"
                  @keydown="handleKeyDown"
              ></div>
            </div>

            <div class="mt-4 flex justify-center">
              <ButtonComponent
                  :class="canSubmit ? '' : 'opacity-50 pointer-events-none'"
                  :icon="Add"
                  template="primary"
                  text="Add"
                  @click="handleSubmit"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.input-card {
  border-radius: 1rem;
  border: 0.1rem solid #C8C8C8;
  background: #F0F0F0;
}

.editable-area {
  min-height: 1.5em;
  max-height: 200px; /* Giới hạn chiều cao tối đa nếu cần */
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Giả lập placeholder cho div contenteditable */
.editable-area:empty:before {
  content: attr(data-placeholder);
  color: #a0a0a0;
  pointer-events: none;
  display: block; /* For Firefox */
}

/* Hiệu ứng chuyển cảnh */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>