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
    template(
      v-if='["original-local", "local-original"].includes(currentQuestion.questionType)'
    )
      div
        h3.mt-16.text-4xl {{ currentQuestion.data.question }}
        p.mt-3.text-base.text-gray-500 {{ currentQuestion.originalTerm.word.notes.annotation }}
      .flex.flex-col.gap-y-3.mx-3
        .p-4.border-2.rounded-lg(
          v-for='option in currentQuestion.data.options',
          :key='option.value',
          :class='getOptionColorClass(option)',
          @click='checkAnswer(option.value)'
        )
          h4.text-base {{ option.value }}
    template(v-if='currentQuestion.questionType === "writing"')
      div
        h3.mt-16.text-4xl {{ currentQuestion.data.question }}
        h4.text-base.text-gray-500 {{ currentQuestion.originalTerm.word.notes.annotation }}
      .mb-16.outline.outline-1.rounded(:class='getWritingColorClass()')
        el-input.h-14(
          v-model='currentQuestion.status.answer',
          :placeholder='writingPlaceholder',
          size='large',
          class='!text-lg',
          autocapitalize='off',
          @keyup.enter='checkAnswer(currentQuestion.status.answer)'
        )
          template(#append)
            el-button(
              type='primary',
              @click='checkAnswer(currentQuestion.status.answer)'
            )
              el-icon
                ElIconCheck
    template(
      v-if='["audio-original", "audio-local"].includes(currentQuestion.questionType)'
    )
      el-row.mt-8(justify='center')
        el-button(
          type='primary',
          circle,
          size='large',
          class='!w-32 !h-32',
          @click='playQuestion'
        )
          el-icon(size='100')
            ElIconMicrophone
      .mb-16
        .outline.outline-1.rounded.mb-1(:class='getAudioColorClass()')
          el-input.h-14(
            v-model='currentQuestion.status.answer',
            :placeholder='audioPlaceholder',
            size='large',
            class='!text-lg',
            autocapitalize='off',
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
})

const voiceover = useCookie<Record<string, string>>('voiceover')
const { t } = useI18n({ useScope: 'local' })
const { play } = useVoiceover()
const testStore = useTestStore()

if (!testStore.questions.length) {
  navigateTo('/', { replace: true })
}

// remove this?
const error = reactive({
  dialog: false,
  question: '',
  answer: '',
  correct: '',
})

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

const getWritingColorClass = () => {
  if (!currentQuestion.value.status.answered) return 'outline-none'

  if (currentQuestion.value.status.correct) {
    return 'outline-green-500'
  }
  return 'outline-red-500'
}

const getAudioColorClass = () => {
  if (!currentQuestion.value.status.answered) return 'outline-none'

  if (currentQuestion.value.status.correct) {
    return 'outline-green-500'
  }
  return 'outline-red-500'
}

const writingPlaceholder = computed(() => {
  if (!currentQuestion.value) return ''

  return t(`writing.placeholder.fi`)
})

const audioPlaceholder = computed(() => {
  if (!currentQuestion.value) return ''

  let language = ''

  if (currentQuestion.value.questionType === 'audio-original') {
    language = 'fi'
  }
  if (currentQuestion.value.questionType === 'audio-local') {
    language = 'ru'
  }

  return t(`audio.placeholder.${language}`)
})

const playQuestion = () => {
  play(currentQuestion.value.data.question, {
    language: 'fi-FI',
    preset: voiceover.value?.['rus-fin'],
  })
}

watchEffect(() => {
  if (!currentQuestion.value) return
  if (
    currentQuestion.value.questionType === 'audio-original' ||
    currentQuestion.value.questionType === 'audio-local'
  ) {
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
  writing:
    placeholder:
      en: Type in English
      ru: Type in Russian
      fi: Type in Finnish
  audio:
    placeholder:
      en: Type in English
      ru: Type in Russian
      fi: Type in Finnish
ru:
  error:
    title: Ошибка
    correct: Правильно
    youSaid: Вы сказали
    next: Далее
  writing:
    placeholder:
      en: Напишите на английском
      ru: Напишите на русском
      fi: Напишите на финском
  audio:
    placeholder:
      en: Напишите на английском
      ru: Напишите на русском
      fi: Напишите на финском
fi:
  error:
    title: Väärin
    correct: Oikein
    youSaid: Vastasit
    next: Seuraava
  writing:
    placeholder:
      en: Kirjoita englanniksi
      ru: Kirjoita venäjäksi
      fi: Kirjoita suomeksi
  audio:
    placeholder:
      en: Kirjoita englanniksi
      ru: Kirjoita venäjäksi
      fi: Kirjoita suomeksi
</i18n>
