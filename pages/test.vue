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
      p.text-sm.text-red-500 You said:
      h4.text-xl {{ error.answered }}
      .mb-5
      p.text-sm.text-green-600 Correct:
      h4.text-xl {{ error.correct }}
      el-button.w-full.mt-5(plain, @click='nextQuestion') Next
  el-progress.mb-4(
    :percentage='(progress.current / progress.total) * 100',
    :show-text='false'
  )
  .flex.flex-col.justify-between.relative(v-if='currentQuestion', class='h-[95%]')
    h3.mt-16.text-4xl {{ currentQuestion.data.question }}
    .flex.flex-col.gap-y-3.mx-3
      .p-4.border-2.border-gray-500.rounded-lg(
        v-for='option in currentQuestion.data.options',
        :key='option.value',
        @click='checkAnswer(option.value)'
      )
        h4 {{ option.value }}
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { api } = useFeathers()
const testStore = useTestStore()

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

const checkAnswer = async (answer: string) => {
  // if (error.dialog) return
  const correct = answer === currentQuestion.value.data.correct
  if (!correct) {
    error.dialog = true
    error.question = currentQuestion.value.data.question
    error.answered = answer
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
  testStore.progress.current += 1
  if (progress.value.current === progress.value.total) {
    return navigateTo('/')
  }
}
</script>

<style scoped lang="scss"></style>
