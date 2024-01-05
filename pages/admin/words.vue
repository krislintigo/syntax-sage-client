<template lang="pug">
div
  el-button.my-2(type='primary', @click='addNew') Reset form (add new)
  h3 Filters
  el-row.gap-x-3
    el-input(
      v-model='filter.search',
      placeholder='Search',
      :suffix-icon='ElIconSearch',
      class='!w-60'
    )
    el-select(v-model='filter.course')
      el-option(
        v-for='item in COURSES',
        :key='item.value',
        :label='item.title',
        :value='item.value'
      )
    el-button.ml-3(:icon='ElIconClose', circle, @click='filter.course = ""')
  h3.mt-5 Form
  el-card(v-if='word')
    el-form(ref='form', :model='word', :rules='rules')
      el-row.gap-x-5
        el-form-item(label='Original', prop='original')
          el-input(v-model='word.original')
        el-form-item(label='Local', prop='local')
          el-input(v-model='word.local')
        el-form-item(label='English', prop='english')
          el-input(v-model='word.english')
        el-form-item(label='Notes', prop='notes')
          el-input(v-model='word.notes')
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
        el-button(type='primary', @click='save') {{ word._id ? 'Save' : 'Add' }}
  el-table(v-loading='words$.isPending', :data='words$.data')
    el-table-column(prop='original', label='Original')
    el-table-column(prop='local', label='Local')
    el-table-column(prop='english', label='English')
    el-table-column(prop='notes', label='Notes')
    el-table-column(prop='course', label='Course')
    el-table-column
      template(#default='{ row: item }')
        el-button(
          type='primary',
          circle,
          size='small',
          :icon='ElIconEditPen',
          @click='edit(item)'
        )
        el-popconfirm(
          title='Delete?',
          width='150',
          confirm-button-text='Yes',
          cancel-button-text='No',
          @confirm='remove(item)'
        )
          template(#reference)
            el-button(
              :icon='ElIconDelete',
              type='danger',
              size='small',
              circle
            )
  el-pagination.mt-3(
    v-model:current-page='words$.currentPage',
    v-model:page-size='words$.limit',
    layout='prev, pager, next, sizes, total',
    :page-sizes='[10, 20, 50]',
    :total='words$.total'
  )
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { ElMessageBox } from '#imports'

definePageMeta({
  layout: 'admin',
  permission: [],
})

const rules: FormRules = {
  original: [
    {
      required: true,
      message: 'Enter original',
      trigger: 'blur',
    },
  ],

  local: [
    {
      required: true,
      message: 'Enter local',
      trigger: 'blur',
    },
  ],
  english: [
    {
      required: true,
      message: 'Enter english',
      trigger: 'blur',
    },
  ],
  course: [
    {
      required: true,
      message: 'Select course',
      trigger: 'blur',
    },
  ],
}

const { api } = useFeathers()

const form = ref<any>(null)
const word = ref(api.service('words').new())
const filter = reactive({
  search: '',
  course: '',
})

const query = computed(() => ({
  query: {
    ...(filter.course && { course: filter.course }),
    ...(filter.search && {
      $or: [
        { original: { $regex: filter.search, $options: 'i' } },
        { english: { $regex: filter.search, $options: 'i' } },
        { local: { $regex: filter.search, $options: 'i' } },
      ],
    }),
  },
}))

const words$ = api.service('words').useFind(query, { paginateOn: 'server' })

const validate = async () => {
  try {
    word.value.original = word.value.original.trim()
    word.value.local = word.value.local.trim()
    word.value.english = word.value.english.trim()
    word.value.notes = word.value.notes.trim()
    await form.value.validate()
    return true
  } catch (error) {
    return false
  }
}

const addNew = () => {
  word.value = api.service('words').new()
}

const edit = ({ _id }: any) => {
  word.value = api.service('words').getFromStore(_id, { clones: true }).value
}

const remove = async ({ _id }: any) => {
  if (word.value._id === _id) addNew()
  await api.service('words').remove(_id)
  ElMessage.success('Word removed')
}

const save = async () => {
  const valid = await validate()
  if (!valid) return ElMessage.warning('Form is not valid')

  const duplicate = await api.service('words').find({
    query: {
      original: word.value.original,
      course: word.value.course,
      $limit: 1,
    },
  })
  if (duplicate.total) {
    const result = await ElMessageBox.confirm(
      `Found duplicate for ${duplicate.data[0].original} - ${duplicate.data[0].local}`,
      'Duplicate',
      {
        confirmButtonText: 'Still save',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    ).catch(() => false)
    if (!result) return
  }

  await word.value.save()
  ElMessage.success('Word saved')
  word.value.reset()
  addNew()
}
</script>

<style scoped lang="scss"></style>
