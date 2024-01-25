<template lang="pug">
.h-full
  client-only
    el-dialog(
      v-model='error.dialog',
      width='90%',
      :title='t("error.title") + "!"',
      align-center,
      :show-close='false',
      :close-on-click-modal='false',
      :close-on-press-escape='false'
    )
      p.text-xl.font-semibold {{ error.question }}
      .mb-5
      p.text-sm.text-green-600 {{ t('error.correct') }}:
      h4.text-xl {{ error.correct }}
      .mb-5
      p.text-sm.text-red-500 {{ t('error.youSaid') }}:
      h4.text-xl {{ error.answer }}
      el-button.w-full.mt-5(plain, @click='nextQuestion') {{ t('error.next') }}
  el-progress.mb-4(
    :percentage='(progress.current / progress.total) * 100',
    :show-text='false'
  )
  .flex.flex-col.justify-between.relative(v-if='currentQuestion', class='h-[95%]')
    div(
      v-if='currentQuestion.type.includes("match") || currentQuestion.type.includes("writing")'
    )
      h3.mt-16.text-4xl {{ currentQuestion.data.question }}
      p.mt-3.text-base.text-gray-500 {{ currentQuestion.originalTerm.word.notes.annotation }}
      p.mt-3.text-xl.text-gray-500(@click='showEnglish = !showEnglish') {{ showEnglish ? currentQuestion.originalTerm.word.english : '*****' }}
    el-row.mt-8(
      v-if='currentQuestion.type.includes("audio")',
      justify='center'
    )
      el-button(
        type='primary',
        circle,
        size='large',
        class='!w-32 !h-32',
        @click='playQuestion'
      )
        el-icon(size='100')
          ElIconMicrophone
    .flex.flex-col.gap-y-3.mx-3(
      v-if='currentQuestion.type.includes("options")'
    )
      .p-4.border-2.rounded-lg(
        v-for='option in currentQuestion.data.options',
        :key='option.value',
        :class='getOptionColorClass(option)',
        @click='checkAnswer(option.value)'
      )
        h4.text-base {{ option.value }}
    .mb-16.outline.outline-1.rounded(
      v-if='currentQuestion.type.includes("input")',
      :class='getInputColorClass()'
    )
      el-input.h-14(
        v-model='currentQuestion.status.answer',
        :placeholder='inputPlaceholder',
        size='large',
        class='!text-lg',
        autocapitalize='off',
        autofocus,
        @keyup.enter='checkAnswer(currentQuestion.status.answer)'
      )
        template(#append)
          el-button(
            type='primary',
            @click='checkAnswer(currentQuestion.status.answer)'
          )
            el-icon
              ElIconCheck
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
  middleware: ['test-setup-middleware'],
})

const voiceover = useCookie<Record<string, string>>('voiceover')
const { t } = useI18n({ useScope: 'local' })
const { play } = useVoiceover()
const testStore = useTestStore()

// remove this?
const error = reactive({
  dialog: false,
  question: '',
  answer: '',
  correct: '',
})
const showEnglish = ref(false)

const progress = computed(() => testStore.progress)
const currentQuestion = computed(
  () => testStore.questions[progress.value.current],
)

const getOptionColorClass = (option: { value: string }) => {
  if (!currentQuestion.value.status.answered) return 'border-gray-500'

  if (option.value === currentQuestion.value.data.correct) {
    return 'border-green-500'
  }
  if (
    !currentQuestion.value.status.correct &&
    option.value === currentQuestion.value.status.answer
  ) {
    return 'border-red-500'
  }
  return 'border-gray-500'
}

const getInputColorClass = () => {
  if (!currentQuestion.value.status.answered) return 'outline-none'

  if (currentQuestion.value.status.correct) {
    return 'outline-green-500'
  }
  return 'outline-red-500'
}

const inputPlaceholder = computed(() => {
  if (!currentQuestion.value) return ''

  let language = ''

  if (currentQuestion.value.type.includes('writing')) {
    language = 'fi'
  }
  if (currentQuestion.value.type.includes('audio')) {
    language = 'fi'
  }

  return t(`input.placeholder.${language}`)
})

const playQuestion = () => {
  play(currentQuestion.value.data.question, {
    language: 'fi-FI',
    preset: voiceover.value?.['rus-fin'],
  })
}

watchEffect(() => {
  if (!currentQuestion.value) return
  if (currentQuestion.value.type.includes('audio')) {
    setTimeout(() => {
      playQuestion()
    }, 500)
  }
})

const checkAnswer = async (_answer: string) => {
  if (!_answer) return
  testStore.answer(_answer)
  if (!currentQuestion.value.status.correct) {
    error.dialog = true
    error.question = currentQuestion.value.data.question
    error.answer = currentQuestion.value.status.answer
    error.correct = currentQuestion.value.data.correct
    return
  }
  const termToUpdate = currentQuestion.value.originalTerm.clone()
  termToUpdate.studies[currentQuestion.value.studyType] += 1
  termToUpdate.lastStudiedAt = new Date().toISOString()
  await termToUpdate.save()
  termToUpdate.reset()
  nextQuestion()
}

const nextQuestion = () => {
  error.dialog = false
  showEnglish.value = false
  setTimeout(() => {
    progress.value.current += 1
    if (progress.value.current === progress.value.total) {
      return navigateTo('/test/result', { replace: true })
    }
  }, 300)
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  error:
    title: Mistake
    correct: Correct
    youSaid: You said
    next: Next
  input:
    placeholder:
      ru: Type in Russian
      fi: Type in Finnish
ru:
  error:
    title: Ошибка
    correct: Правильно
    youSaid: Вы сказали
    next: Далее
  input:
    placeholder:
      ru: Напишите на русском
      fi: Напишите на финском
fi:
  error:
    title: Väärin
    correct: Oikein
    youSaid: Vastasit
    next: Seuraava
  input:
    placeholder:
      ru: Kirjoita venäjäksi
      fi: Kirjoita suomeksi
</i18n>
