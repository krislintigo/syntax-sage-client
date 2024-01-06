<template lang="pug">
.h-full
  .h-full.flex.flex-col.justify-between
    .flex.flex-col.gap-y-3
      h2.text-xl.text-center Test is completed
      h3.text-green-500 {{ correct }} correct answers
      h3.text-red-500 {{ incorrect }} incorrect answers
      h3.text-blue-500 Result: {{ Math.round((correct / (correct + incorrect)) * 100) }} %
    el-button(type='primary', size='large', @click='goHome') Restart
</template>

<script setup lang="ts">
const testStore = useTestStore()
if (!testStore.questions.length) {
  navigateTo('/', { replace: true })
}

const correct = computed(
  () => testStore.questions.filter((q) => q.status.correct).length,
)
const incorrect = computed(
  () => testStore.questions.filter((q) => !q.status.correct).length,
)

const goHome = async () => {
  await navigateTo('/', { replace: true })
  testStore.reset()
}
</script>

<style scoped lang="scss"></style>
