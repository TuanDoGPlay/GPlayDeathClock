<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  label?: string
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
  emit('change')
}
</script>

<template>
  <div
      class="flex items-center justify-between w-full cursor-pointer select-none"
      @click="toggle"
  >
    <div class="flex items-center gap-3">
      <div
          :class="modelValue ? 'bg-transparent' : 'bg-[#D9D9D9]'"
          class="rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
          style="border-color: #D9D9D9;height: 1.05rem; width: 1.05rem;border-width: 0.15rem;"
      >
        <svg
            v-if="modelValue"
            class="w-2.5 h-2.5 "
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
        </svg>
      </div>

      <span
          :style="{ color: modelValue ? 'var(--plus)' : 'var(--secondary-text)' }"
          class="font-medium transition-colors duration-200"
      >
        {{ label }}
      </span>
    </div>
    <slot/>
  </div>
</template>