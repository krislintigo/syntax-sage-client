<template lang="pug">
.h-full
  client-only
    el-dialog(
      v-if='currentQuestion',
      v-model='dialog',
      width='90%',
      :title='currentQuestion.status.correct ? t("dialog.correct.title") : t("dialog.error.title")',
      align-center,
      :class='["!border !rounded", { "border-green-500": currentQuestion.status.correct, "border-red-500": !currentQuestion.status.correct }]',
      :show-close='false',
      :close-on-click-modal='false',
      :close-on-press-escape='false'
    )
      template(v-if='currentQuestion.status.correct')
        p.text-3xl {{ currentQuestion.originalTerm.word.original }}
        p.text-2xl {{ currentQuestion.originalTerm.word.local }}
        .mb-3
        p.text-base {{ currentQuestion.originalTerm.word.english }}
      template(v-else)
        p.text-xl.font-semibold {{ currentQuestion.data.question }}
        .mb-5
        p.text-sm.text-green-600 {{ t('dialog.error.correct') }}:
        p.text-xl {{ currentQuestion.data.correct }}
        .mb-5
        p.text-sm.text-red-500 {{ t('dialog.error.youSaid') }}:
        p.text-xl {{ currentQuestion.status.answer }}
      el-button.w-full.mt-5(plain, size='large', @click='nextQuestion') {{ t('dialog.next') }}
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
    div
      .flex.flex-col.gap-y-3.mx-3(
        v-if='currentQuestion.type.includes("options")'
      )
        .p-4.border-2.border-gray-500.rounded-lg(
          v-for='option in currentQuestion.data.options',
          :key='option.value',
          @click='checkAnswer(option.value)'
        )
          h4.text-base {{ option.value }}
      .rounded(v-if='currentQuestion.type.includes("input")')
        el-input.h-14(
          v-model='currentQuestion.status.answer',
          :placeholder='inputPlaceholder',
          size='large',
          class='!text-lg',
          readonly,
          autocapitalize='off',
          autocomplete='off',
          @keyup.enter='checkAnswer(currentQuestion.status.answer)',
          @keydown='onInput'
        )
          template(#append)
            el-button(
              type='primary',
              @click='checkAnswer(currentQuestion.status.answer)'
            )
              el-icon
                ElIconCheck
        InputKeyboard.mt-3(v-model='currentQuestion.status.answer')
      .mt-3.text-center
        el-button.w-full(
          text,
          type='danger',
          class='!text-lg',
          @click='checkAnswer("-")'
        ) {{ t('input.dontKnow') }}
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

const dialog = ref(false)
const showEnglish = ref(false)

const progress = computed(() => testStore.progress)
const currentQuestion = computed(
  () => testStore.questions[progress.value.current],
)

const inputPlaceholder = computed(() => {
  if (!currentQuestion.value) return ''
  return t(`input.placeholder.fi`)
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
  dialog.value = true
  if (!currentQuestion.value.status.correct) return

  const termToUpdate = currentQuestion.value.originalTerm.clone()
  termToUpdate.studies[currentQuestion.value.studyType] += 1
  termToUpdate.lastStudiedAt = new Date().toISOString()
  if (!termToUpdate.viewed) termToUpdate.viewed = true

  await termToUpdate.save()
  termToUpdate.reset()
}

const onInput = (e: KeyboardEvent) => {
  const letter = e.key
  if (/^[a-zA-Zа-яА-Я-]$/.test(letter)) {
    currentQuestion.value.status.answer += letter
  } else if (letter === 'Backspace') {
    currentQuestion.value.status.answer =
      currentQuestion.value.status.answer.slice(0, -1)
  }
}

const nextQuestion = () => {
  dialog.value = false
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
  dialog:
    correct:
      title: Correct!
    error:
      title: Mistake!
      correct: Correct
      youSaid: You said
    next: Next
  input:
    placeholder:
      ru: Type in Russian
      fi: Type in Finnish
    dontKnow: I don't know
ru:
  dialog:
    correct:
      title: Правильно!
    error:
      title: Ошибка!
      correct: Правильно
      youSaid: Вы сказали
    next: Далее
  input:
    placeholder:
      ru: Напишите на русском
      fi: Напишите на финском
    dontKnow: Не знаю
fi:
  dialog:
    correct:
      title: Oikein!
    error:
      title: Väärin!
      correct: Oikein
      youSaid: Vastasit
    next: Seuraava
  input:
    placeholder:
      ru: Kirjoita venäjäksi
      fi: Kirjoita suomeksi
    dontKnow: En tiedä
</i18n>
