<template lang="pug">
.h-full
  .h-full.flex.flex-col.justify-between
    .flex.flex-col.gap-y-3
      h2.text-xl.text-center {{ t('result.title') }}
      h3.text-green-500 {{ correct }} {{ t('result.correct') }}
      h3.text-red-500 {{ incorrect }} {{ t('result.incorrect') }}
      h3.text-blue-500 {{ t('result.result') }}: {{ Math.round((correct / (correct + incorrect)) * 100) }} %
    el-button.mb-8(type='primary', size='large', @click='goHome') {{ t('result.goHome') }}
</template>

<script setup lang="ts">
const { t } = useI18n({ useScope: 'local' })
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

<i18n lang="yaml">
en:
  result:
    title: Test is completed
    correct: correct answers
    incorrect: incorrect answers
    result: Result
    goHome: Back home
ru:
  result:
    title: Тест завершен
    correct: правильных ответов
    incorrect: неправильных ответов
    result: Результат
    goHome: На главную
fi:
  result:
    title: Testi on valmis
    correct: oikeita vastauksia
    incorrect: vääriä vastauksia
    result: Tulos
    goHome: Takaisin kotiin
</i18n>
