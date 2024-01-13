<template lang="pug">
.h-full
  .flex.flex-col.gap-y-5
    div
      h3.text-xl.mb-3 {{ t('welcome') }}, {{ authStore.user.login }}
      el-button(type='danger', @click='logout') {{ t('logout') }}
    div
      h4.text-lg.mb-1 {{ t('appLanguage') }}
      client-only
        el-select.w-full(v-model='locale', size='large')
          el-option(label='English', value='en')
          el-option(label='Русский', value='ru')
          el-option(label='Suomi', value='fi')
    div
      h4.text-lg.mb-1 {{ t('courseVoiceover') }}
      client-only
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
      p.mt-2.mx-3.text-sm.text-gray-400 {{ t('voiceoverNote') }}
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
const authStore = useAuthStore()
const voiceover = useCookie('voiceover', {
  default: () => ({ 'rus-fin': '' }),
  expires: dayjs().add(1, 'year').toDate(),
})
const { locale, setLocale } = useI18n({ useScope: 'local' })
const { getVoices } = useVoiceover()

const voices = ref<any[]>([])

const setVoiceover = (key: string, value: string) => {
  voiceover.value = { ...voiceover.value, [key]: value }
}

const logout = async () => {
  await navigateTo('/login', { replace: true })
  await authStore.logout()
}

watchEffect(() => setLocale(locale.value))

onMounted(() => {
  setTimeout(() => {
    voices.value = getVoices({ language: 'fi-FI' })
  }, 500)
})
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  welcome: Welcome
  logout: Logout
  appLanguage: App language
  courseVoiceover: Course voiceover
  voiceoverNote: "Note: if you don't see the list of voiceovers, go to your device settings and install the language pack for the corresponding language."
  toHomepage: To homepage
ru:
  welcome: Добро пожаловать
  logout: Выйти
  appLanguage: Язык приложения
  courseVoiceover: Голосовое сопровождение курса
  voiceoverNote: 'Замечание: если вы не видите список озвучек, зайдите в настройки своего устройства и установите языковой пакет для соответствующего языка.'
  toHomepage: На главную
fi:
  welcome: Tervetuloa
  logout: Kirjaudu ulos
  appLanguage: Sovelluksen kieli
  courseVoiceover: Kurssin ääniraita
  voiceoverNote: 'Huomautus: jos ääniraitaluetteloa ei näy, asenna vastaava kielipaketti laitteesi asetuksissa.'
  toHomepage: Etusivulle
</i18n>
