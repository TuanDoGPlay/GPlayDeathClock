<template>
  <div class="input-wrapper">
    <input
        v-model="model"
        class="styled-input"
        spellcheck="false"
        :type="type"
        v-bind="$attrs"
    />
  </div>
</template>

<script setup>
defineOptions({
  inheritAttrs: false
});

defineProps({
  type: {
    type: String,
    default: 'text'
  }
});

const model = defineModel();
</script>

<style scoped>
.input-wrapper {
  display: flex;
  width: 100%;
}

/* --- Style chung --- */
.styled-input {
  width: 100%;
  max-width: 20rem;
  padding: 0.625rem 1.25rem;
  border-radius: 2rem;
  background-color: #FFF5EA;
  border: 0.125rem solid #EED8C0;
  color: var(--highlight-text);
  font-family: sans-serif;
  font-weight: 600;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.styled-input:focus {
  border-color: #EBC0A0;
  background-color: #FFF9F4;
}

/* --- NHÓM 1: CĂN GIỮA (Text, Number, Password...) --- */
/* Đã thêm [type="number"] vào đây */
.styled-input:is(
  [type="text"],
  [type="password"],
  [type="email"],
  [type="search"],
  [type="tel"],
  [type="url"],
  [type="number"]
) {
  text-align: center;
  caret-color: var(--highlight-text);
}


/* Chỉnh icon lịch/đồng hồ */
.styled-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
  transition: 0.2s;
  margin-left: 0.5rem;
}
.styled-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* --- NHÓM 3: FILE & COLOR --- */
.styled-input[type="color"] {
  padding: 0.2rem 0.5rem;
  height: 3rem;
  cursor: pointer;
  text-align: center;
}

.styled-input[type="file"] {
  padding: 0.5rem;
  text-transform: none;
  font-size: 0.9rem;
  text-align: left;
}
.styled-input[type="file"]::file-selector-button {
  border: none;
  background: #EED8C0;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  color: var(--highlight-text);
  cursor: pointer;
  margin-right: 1rem;
  font-weight: bold;
}
</style>