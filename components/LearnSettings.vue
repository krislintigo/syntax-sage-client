<template lang="pug">
div
  template(v-if='count >= 1')
    h3.text-xl.text-center.mb-5 {{ t('settings.title') }}
    el-row.gap-x-3(justify='space-between', align='middle')
      h4.w-20.text-base {{ t('settings.numberOfQuestions') }}
      el-input-number(
        v-model='settings.questions',
        :max='count * settings.questionTypes.length',
        :min='1'
      )
    .my-5
    el-row.gap-x-3(justify='space-between', align='middle')
      h4.w-20.text-base {{ t('settings.questionTypes') }}
      el-checkbox-group(v-model='settings.questionTypes')
        el-checkbox-button(label='match')
          el-icon
            ElIconConnection
        el-checkbox-button(label='writing')
          el-icon
            ElIconEditPen
        el-checkbox-button(label='audio')
          el-icon
            ElIconHeadset
    .mt-4
    el-row(justify='center')
      el-button.w-full(type='primary', size='large', @click='$emit("start")') {{ t('settings.startTest') }}
  template(v-else)
    h3.text-xl.text-center.px-3 {{ t('settings.addMoreToContinue') }}
</template>

<script setup lang="ts">
type Settings = {
  questions: number
  questionTypes: (keyof Term['studies'])[]
}

const props = defineProps<{ modelValue: Settings; count: number }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Settings): void
  (e: 'start'): void
}>()

const { t } = useI18n({ useScope: 'local' })

const settings = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

watchEffect(() => {
  settings.value.questions = Math.min(props.count, 50)
  if (!settings.value.questionTypes.length) {
    settings.value.questionTypes = ['match']
  }
})
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  settings:
    title: Keep learning!
    addMoreToContinue: Add more terms to enable testing and continue learning!
    numberOfQuestions: Number of questions
    questionTypes: Types of questions
    startTest: Start test
ru:
  settings:
    title: Продолжайте учиться!
    addMoreToContinue: Добавьте больше терминов, чтобы включить тестирование и продолжить обучение!
    numberOfQuestions: Количество вопросов
    questionTypes: Типы вопросов
    startTest: Начать тест
fi:
  settings:
    title: Jatka opiskelua!
    addMoreToContinue: Lisää sanoja suorittaaksesi testit ja jatkaksesi opiskelua!
    numberOfQuestions: Kysymysmäärä
    questionTypes: Kysymystyypit
    startTest: Aloita testi
</i18n>
