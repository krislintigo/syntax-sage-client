<template lang="pug">
.h-full
  client-only
    el-dialog(
      v-model='error.dialog',
      width='90%',
      title='Error!',
      align-center,
      :show-close='false',
      :close-on-click-modal='false',
      :close-on-press-escape='false'
    )
      p.text-xl.font-semibold {{ error.question }}
      .mb-5
      p.text-sm.text-green-600 Correct:
      h4.text-xl {{ error.correct }}
      .mb-5
      p.text-sm.text-red-500 You said:
      h4.text-xl {{ error.answered }}
      el-button.w-full.mt-5(plain, @click='nextQuestion') Next
  el-progress.mb-4(
    :percentage='(progress.current / progress.total) * 100',
    :show-text='false'
  )
  .flex.flex-col.justify-between.relative(v-if='currentQuestion', class='h-[95%]')
    h3.mt-16.text-4xl {{ currentQuestion.data.question }}
    .flex.flex-col.gap-y-3.mx-3
      .p-4.border-2.rounded-lg(
        v-for='option in currentQuestion.data.options',
        :key='option.value',
        :class='getOptionColorClass(option)',
        @click='checkAnswer(option.value)'
      )
        h4 {{ option.value }}
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const testStore = useTestStore()
if (!testStore.questions.length) {
  navigateTo('/')
}

const answer = reactive({
  value: '',
  correct: false,
})
const error = reactive({
  dialog: false,
  question: '',
  answered: '',
  correct: '',
})

const progress = computed(() => testStore.progress)
const currentQuestion = computed(
  () => testStore.questions[progress.value.current],
)

const getOptionColorClass = (option: { value: string }) => {
  if (!answer.value) return 'border-gray-500'

  if (option.value === currentQuestion.value.data.correct) {
    return 'border-green-500'
  }
  if (!answer.correct && option.value === answer.value) {
    return 'border-red-500'
  }
  return 'border-gray-500'
}

const checkAnswer = async (_answer: string) => {
  const correct = _answer === currentQuestion.value.data.correct
  answer.value = _answer
  answer.correct = correct
  if (!correct) {
    error.dialog = true
    error.question = currentQuestion.value.data.question
    error.answered = answer.value
    error.correct = currentQuestion.value.data.correct
    return
  }
  const termToUpdate = currentQuestion.value.originalTerm.clone()
  termToUpdate.studies[currentQuestion.value.studyType] += 1
  await termToUpdate.save() // test
  termToUpdate.reset()
  nextQuestion()
}

const nextQuestion = () => {
  error.dialog = false
  setTimeout(() => {
    answer.value = ''
    progress.value.current += 1
    if (progress.value.current === progress.value.total) {
      return navigateTo('/')
    }
  }, 300)
}
</script>

<style scoped lang="scss"></style>
