<template lang="pug">
.flex.flex-col.gap-y-3
  el-form(ref='form', :model='authData', :rules='rules')
    el-form-item(prop='login')
      el-input(v-model='authData.login', :placeholder='t("form.fields.login")')
    el-form-item(prop='password')
      el-input(
        v-model='authData.password',
        type='password',
        :placeholder='t("form.fields.password")'
      )
  el-row
    el-button.grow(type='primary', @click='register') {{ t('form.actions.register') }}
    el-button.grow(type='primary', @click='login') {{ t('form.actions.login') }}
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'

definePageMeta({
  layout: 'default',
  permission: 'public',
})

const { t: tG } = useI18n({ useScope: 'global' })
const { t } = useI18n({ useScope: 'local' })

const rules: FormRules = {
  login: [
    {
      required: true,
      message: t('form.error.login.required'),
      trigger: 'change',
    },
  ],
  password: [
    {
      required: true,
      message: t('form.error.password.required'),
      trigger: 'change',
    },
  ],
}

const { api } = useFeathers()
const authStore = useAuthStore()

const form = ref<any>(null)
const authData = reactive({
  login: '',
  password: '',
})

const validate = async () => {
  try {
    authData.login = authData.login.trim()
    authData.password = authData.password.trim()
    await form.value.validate()
    return true
  } catch (error) {
    return false
  }
}

const register = async () => {
  try {
    const valid = await validate()
    if (!valid) return ElMessage.warning(tG('error.form.invalid'))
    const student = api
      .service('users')
      .new({ ...authData, roles: ['student'] })
    await student.save()
    await login()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const login = async () => {
  try {
    const valid = await validate()
    if (!valid) return ElMessage.warning(tG('error.form.invalid'))
    await authStore.authenticate({ strategy: 'local', ...authData })
    await navigateTo('/')
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  form:
    fields:
      login: Login
      password: Password
    error:
      login:
        required: Enter login
      password:
        required: Enter password
    actions:
      register: Register
      login: Login
ru:
  form:
    fields:
      login: Логин
      password: Пароль
    error:
      login:
        required: Введите логин
      password:
        required: Введите пароль
    actions:
      register: Регистрация
      login: Войти
fi:
  form:
    fields:
      login: Kirjautuminen
      password: Salasana
    error:
      login:
        required: Anna kirjautuminen
      password:
        required: Anna salasana
    actions:
      register: Rekisteröinti
      login: Kirjaudu
</i18n>
