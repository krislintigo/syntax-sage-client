<template lang="pug">
.flex.flex-col.gap-y-3
  el-form(ref='form', :model='authData', :rules='rules')
    el-form-item(prop='login')
      el-input(v-model='authData.login', placeholder='Login')
    el-form-item(prop='password')
      el-input(
        v-model='authData.password',
        type='password',
        placeholder='Password'
      )
  el-row
    el-button.grow(type='primary', @click='register') Register
    el-button.grow(type='primary', @click='login') Login
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'

definePageMeta({
  layout: 'default',
  permission: 'public',
})

const rules: FormRules = {
  login: [
    {
      required: true,
      message: 'Enter login',
      trigger: 'change',
    },
  ],
  password: [
    {
      required: true,
      message: 'Enter password',
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
    if (!valid) return ElMessage.warning('Form is not valid')
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
    if (!valid) return ElMessage.warning('Please fill out all fields correctly')
    await authStore.authenticate({ strategy: 'local', ...authData })
    await navigateTo('/')
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}
</script>

<style scoped lang="scss"></style>
