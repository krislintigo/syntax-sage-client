<template lang="pug">
div
  h2.text-xl Adding new
  el-button.my-2(type='primary', @click='addNew') Add new
  el-button.my-2(type='primary', @click='auth') Auth
  el-row
    el-select(v-model='filter.course')
      el-option(
        v-for='item in COURSES',
        :key='item.value',
        :label='item.title',
        :value='item.value'
      )
    el-button.ml-3(:icon='ElIconClose', circle, @click='filter.course = ""')
  el-card.my-5(v-if='word')
    el-form(ref='form', :model='word', :rules='rules')
      el-row.gap-x-5
        el-form-item(label='Original', prop='original')
          el-input(v-model='word.original')
        el-form-item(label='English', prop='english')
          el-input(v-model='word.english')
        el-form-item(label='Local', prop='local')
          el-input(v-model='word.local')
        el-form-item(label='Course', prop='course')
          el-select(v-model='word.course')
            el-option(
              v-for='item in COURSES',
              :key='item.value',
              :label='item.title',
              :value='item.value'
            )
        el-form-item(label='Categories', prop='categories')
          el-select(v-model='word.categories', multiple)
            el-option(
              v-for='item in CATEGORIES',
              :key='item.value',
              :label='item.title',
              :value='item.value'
            )
        el-button(type='primary', @click='save') Add
  client-only
    el-table(v-loading='isPending', :data='data')
      el-table-column(prop='original', label='Original')
      el-table-column(prop='english', label='English')
      el-table-column(prop='local', label='Local')
      el-table-column(prop='course', label='Course')
    el-pagination.mt-3(
      v-model:current-page='currentPage',
      v-model:page-size='limit',
      layout='prev, pager, next, sizes',
      :page-sizes='[10, 20, 50]',
      :total='total'
    )
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'

definePageMeta({
  layout: 'admin',
})

const rules: FormRules = {
  original: [
    {
      required: true,
      message: 'Enter original',
      trigger: 'change',
    },
  ],
  english: [
    {
      required: true,
      message: 'Enter english',
      trigger: 'change',
    },
  ],
  local: [
    {
      required: true,
      message: 'Enter local',
      trigger: 'change',
    },
  ],
  course: [
    {
      required: true,
      message: 'Select course',
      trigger: 'change',
    },
  ],
}

const { api } = useFeathers()
const authStore = useAuthStore()

const form = ref<any>(null)
const word = ref(api.service('words').new())
const filter = reactive({
  course: '',
})

const query = computed(() => ({
  query: {
    ...(filter.course && { course: filter.course }),
  },
}))

const { data, total, isPending, currentPage, limit } = api
  .service('words')
  .useFind(query, { paginateOn: 'server' })

const validate = async () => {
  try {
    await form.value.validate()
    return true
  } catch (error) {
    return false
  }
}

const auth = async () => {
  await authStore.authenticate({
    strategy: 'local',
    login: 'test',
    password: 'test',
  })
  ElMessage.success('Authenticated')
}

const addNew = () => {
  word.value = api.service('words').new()
}
const save = async () => {
  // console.log(word.value)
  const valid = await validate()
  if (!valid) return ElMessage.warning('Form is not valid')
  ElMessage.success('Word added')
  await word.value.save()
  word.value = api.service('words').new()
  await form.value.resetFields()
}
</script>

<style scoped lang="scss"></style>
