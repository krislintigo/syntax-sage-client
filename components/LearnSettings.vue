<template lang="pug">
div
  template(v-if='testCount >= 1')
    el-row.gap-x-3(justify='space-between', align='middle')
      h4.w-20.text-base {{ t('settings.numberOfQuestions') }}
      el-input-number(
        v-model='settings.questions',
        :max='Math.min(testCount * settings.questionTypes.length, 50)',
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
</template>

<script setup lang="ts">
const props = defineProps<{ testCount: number }>()

defineEmits<{ (e: 'start'): void }>()

const { t } = useI18n({ useScope: 'local' })

const settings = defineModel<{
  questions: number
  questionTypes: (keyof Term['studies'])[]
}>({ required: true })

watchEffect(() => {
  settings.value.questions = Math.min(props.testCount, 50)
  if (!settings.value.questionTypes.length) {
    settings.value.questionTypes = ['match']
  }
})
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  settings:
    numberOfQuestions: Number of questions
    questionTypes: Types of questions
    startTest: Start test
ru:
  settings:
    numberOfQuestions: Количество вопросов
    questionTypes: Типы вопросов
    startTest: Начать тест
fi:
  settings:
    numberOfQuestions: Kysymysmäärä
    questionTypes: Kysymystyypit
    startTest: Aloita testi
</i18n>
