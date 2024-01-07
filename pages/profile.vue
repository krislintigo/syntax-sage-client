<template lang="pug">
.h-full
  client-only
    .flex.flex-col.gap-y-5
      div
        h4.text-lg.mb-1 {{ t('appLanguage') }}
        el-select.w-full(v-model='locale', size='large')
          el-option(label='English', value='en')
          el-option(label='Русский', value='ru')
          //el-option(label='Suomi', value='fi')
      div
        h4.text-lg.mb-1 {{ t('courseVoiceover') }}
        el-select.w-full(
          :model-value='voiceover["rus-fin"]',
          size='large',
          @change='setVoiceover("rus-fin", $event)'
        )
          el-option(
            v-for='(voice, i) in voices',
            :key='i',
            :label='voice.name',
            :value='voice.name'
          )
  el-row.mt-8(justify='center')
    el-button(type='primary', @click='navigateTo("/", { replace: true })') {{ t('toHomepage') }}
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const { t } = useI18n({ useScope: 'local' })
const voiceover = useCookie('voiceover', {
  default: () => ({ 'rus-fin': '' }),
  expires: dayjs().add(1, 'year').toDate(),
})
const { locale, setLocale } = useI18n({ useScope: 'local' })
const { getVoices } = useVoiceover()

const voices = ref<any[]>([])

onMounted(() => {
  setTimeout(() => {
    voices.value = getVoices({ language: 'fi-FI' })
  }, 500)
})

const setVoiceover = (key: string, value: string) => {
  voiceover.value = { ...voiceover.value, [key]: value }
}

watchEffect(() => setLocale(locale.value))
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  appLanguage: App language
  courseVoiceover: Course voiceover
  toHomepage: To homepage
ru:
  appLanguage: Язык приложения
  courseVoiceover: Голосовое сопровождение курса
  toHomepage: На главную
fi:
  appLanguage: Sovelluksen kieli
  courseVoiceover: Kurssin ääniraita
  toHomepage: Etusivulle
</i18n>
