<template lang="pug">
.h-full
  .h-full.flex.flex-col.justify-between
    .flex.flex-col.gap-y-3
      h2.text-xl.text-center {{ t('result.title') }}
      h3.text-green-500.text-base
        span {{ t('result.correct') }}:
        span.ml-1.text-2xl {{ correct }}
      h3.text-red-500.text-base
        span {{ t('result.incorrect') }}:
        span.ml-1.text-2xl {{ incorrect }}
      h3.text-blue-500.text-base
        span {{ t('result.result') }}:
        span.ml-1.text-2xl {{ Math.round((correct / (correct + incorrect)) * 100) }} %
    el-button.mb-8(type='primary', size='large', @click='next') {{ t('result.goHome') }}
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
  middleware: ['test-setup-middleware'],
})

const { t } = useI18n({ useScope: 'local' })
const { api } = useFeathers()
const testStore = useTestStore()

const correct = computed(
  () => testStore.questions.filter((q) => q.status.correct).length,
)
const incorrect = computed(
  () => testStore.questions.filter((q) => !q.status.correct).length,
)

const next = async () => {
  const searchIds = testStore.questions
    .filter(({ status: { answered, correct } }) => answered && correct)
    .map((q) => q.originalTerm._id)
  const mastered = await api.service('terms').find({
    query: {
      _id: { $in: searchIds },
      favorite: true,
      status: 'mastered',
      $paginate: false,
    },
  })
  if (mastered.total) {
    testStore.masteredTerms = mastered.data as Term[]
    await navigateTo('/test/remove-mastered', { replace: true })
  } else {
    await navigateTo('/', { replace: true })
    testStore.reset()
  }
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  result:
    title: Test is completed
    correct: Correct answers
    incorrect: Incorrect answers
    result: Result
    goHome: Back home
ru:
  result:
    title: Тест завершен
    correct: Правильных ответов
    incorrect: Неправильных ответов
    result: Результат
    goHome: На главную
fi:
  result:
    title: Testi on suoritettu
    correct: Oikeat vastaukset
    incorrect: Väärät vastaukset
    result: Tuloksesi
    goHome: Takaisin kotisivulle
</i18n>
