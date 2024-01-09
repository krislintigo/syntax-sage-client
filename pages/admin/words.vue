<template lang="pug">
div
  h3 Filters
  el-row.gap-x-3
    el-input(
      v-model='filter.search',
      placeholder='Search',
      :suffix-icon='ElIconSearch',
      class='!w-60'
    )
    client-only
      el-select(v-model='filter.course')
        el-option(
          v-for='item in COURSES',
          :key='item.value',
          :label='item.title',
          :value='item.value'
        )
    el-button.ml-3(:icon='ElIconClose', circle, @click='filter.course = ""')
  el-card.mt-5(header='Upload words from file')
    .flex.flex-col
      el-upload(
        ref='upload',
        v-model:file-list='fileUpload.file',
        :auto-upload='false',
        :show-file-list='false',
        :limit='1',
        :on-exceed='onExceed'
      )
        template(#trigger)
          el-button.w-28(type='info') Select file
      .flex.flex-col.gap-y-3.mt-3(v-if='fileUpload.string')
        span SCHEMA [ original - local - english ]
        el-input(
          v-model='fileUpload.string',
          type='textarea',
          :autosize='{ maxRows: 25 }'
        )
        el-button.w-28(type='primary', @click='saveFromFile') Save
  h3.mt-5 Form
  el-card(v-if='word')
    el-form(ref='form', :model='word', :rules='rules', label-position='top')
      el-row.gap-x-3
        el-button.w-40.mb-5(type='danger', @click='addNew') Reset form
      el-row.gap-x-5
        el-form-item(label='Original', prop='original')
          el-input(v-model='word.original')
        el-form-item(label='Local', prop='local')
          el-input(v-model='word.local')
        el-form-item(label='English', prop='english')
          el-input(v-model='word.english')
        el-form-item(label='Annotation notes', prop='notes.annotation')
          el-input(v-model='word.notes.annotation')
        el-form-item(label='Course', prop='course')
          client-only
            el-select(v-model='word.course')
              el-option(
                v-for='item in COURSES',
                :key='item.value',
                :label='item.title',
                :value='item.value'
              )
        el-form-item(label='Categories', prop='categories')
          client-only
            el-select(v-model='word.categories', multiple)
              el-option(
                v-for='item in CATEGORIES',
                :key='item.value',
                :label='item.title($t)',
                :value='item.value'
              )
        el-form-item(label='Grammar notes', prop='notes.grammar')
          TextEditor(
            v-model='word.notes.grammar',
            editable,
            target='grammar-notes'
          )
      el-button.w-40(type='primary', @click='save') {{ word._id ? 'Save' : 'Add' }}
  el-table(v-loading='words$.isPending', :data='words$.data')
    el-table-column(prop='original', label='Original')
    el-table-column(prop='local', label='Local')
    el-table-column(prop='english', label='English')
    el-table-column(prop='notes.annotation', label='Notes')
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
  client-only
    el-pagination.mt-3(
      v-model:current-page='words$.currentPage',
      v-model:page-size='words$.limit',
      layout='prev, pager, next, sizes, total',
      :page-sizes='[10, 20, 50]',
      :total='words$.total'
    )
</template>

<script setup lang="ts">
import type {
  FormRules,
  UploadFile,
  UploadInstance,
  UploadRawFile,
} from 'element-plus'

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

const filter = reactive({
  search: '',
  course: '',
})
const fileUpload = reactive({
  file: [] as UploadFile[],
  string: '',
})
const upload = ref<UploadInstance>()
const form = ref<any>(null)
const word = ref(api.service('words').new())
const previousOriginal = ref('')

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

words$.isSsr && (await words$.request)

const validate = async () => {
  try {
    word.value.original = word.value.original!.trim()
    word.value.local = word.value.local!.trim()
    word.value.english = word.value.english!.trim()
    word.value.notes!.annotation = word.value.notes!.annotation.trim()
    await form.value.validate()
    return true
  } catch (error) {
    return false
  }
}

const addNew = () => {
  word.value.reset()
  word.value = api.service('words').new()
}

const edit = ({ _id }: any) => {
  word.value = api.service('words').getFromStore(_id, { clones: true }).value
  previousOriginal.value = word.value.original as string
}

const remove = async ({ _id }: any) => {
  if (word.value._id === _id) addNew()
  await api.service('words').remove(_id)
  ElMessage.success('Word removed')
}

const save = async () => {
  const valid = await validate()
  if (!valid) return ElMessage.warning('Form is not valid')

  if (!word.value._id || previousOriginal.value !== word.value.original) {
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
  }

  await word.value.save()
  ElMessage.success('Word saved')
  word.value.reset()
  addNew()
}

const toText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })

watchEffect(async () => {
  const file = fileUpload.file[0]?.raw
  if (!file) return
  fileUpload.string = await toText(file)
})

const onExceed = ([file]: UploadRawFile[]) => {
  upload.value!.clearFiles()
  upload.value!.handleStart(file)
}

const saveFromFile = async () => {
  const lines = fileUpload.string.trim().split('\n')
  const words = lines.map((line) => {
    const [original, local, english = 'NOT_SET'] = line.trim().split(' - ')
    return api.service('words').new({
      original: original?.trim(),
      local: local?.trim(),
      english: english?.trim(),
      course: 'rus-fin',
    })
  })

  const duplicate = await api.service('words').find({
    query: {
      original: { $in: words.map((word) => word.original as string) },
      course: 'rus-fin',
    },
  })

  if (duplicate.total) {
    const duplicatedMessagePart = duplicate.data
      .map((word) => `${word.original} - ${word.local}`)
      .join(' /// ')
    const result = await ElMessageBox.confirm(
      `Found duplicates for some words from the list: ${duplicatedMessagePart}. Do you want to continue?`,
      'Duplicate',
      {
        confirmButtonText: 'Still save',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    ).catch(() => false)
    if (!result) return
  }

  await api.service('words').create(words as Word[])
  ElMessage.success('Words saved')
  fileUpload.string = ''
  fileUpload.file = []
}
</script>

<style scoped lang="scss"></style>
