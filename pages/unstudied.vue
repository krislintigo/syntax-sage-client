<template lang="pug">
div
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      .border-2.rounded-xl.border-gray-600.p-4.mb-3
        h3.text-xl.text-center.mb-5 {{ t('study.title') }}
        el-button.w-full(
          v-if='!toStudy.isSelect',
          size='large',
          @click='toStudy.isSelect = true'
        ) {{ t('study.select') }}
        el-row(v-else)
          el-checkbox(size='large', disabled) Do not study this words
          p.text-sm.text-gray-500 You can always study them later (feature now available now)
          el-row.w-full.mt-5
            el-button.grow(size='large', @click='cancelStudy') {{ t('study.cancel') }}
            el-button.grow(size='large', @click='studyWords') {{ t('study.add') }}
      .mt-4
      el-row(v-for='word in unstudied$.data', :key='word._id', align='middle')
        el-checkbox(
          v-if='toStudy.isSelect',
          :model-value='toStudy.ids.includes(word._id)',
          @click='pushToStudy(word)'
        ) {{  }}
        WordCard.grow(:word='word', hide-favorite, @click='pushToStudy(word)')
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'student',
  permission: ['student'],
})

const { t } = useI18n()
const { api } = useFeathers()
const authStore = useAuthStore()

const filter = inject('filter') as { search: string; categories: string[] }
const toStudy = reactive({
  isSelect: false,
  ids: [] as string[],
})

const unstudiedQuery = computed(() => ({
  query: {
    $intersect: authStore.user._id,
    ...(filter.search && {
      $or: [
        { original: { $regex: filter.search, $options: 'i' } },
        { english: { $regex: filter.search, $options: 'i' } },
        { local: { $regex: filter.search, $options: 'i' } },
      ],
    }),
    ...(filter.categories.length && {
      categories: {
        $in: filter.categories,
      },
    }),
    $paginate: false,
  },
}))

const unstudied$ = api
  .service('words')
  .useFind(unstudiedQuery, { paginateOn: 'server' })

unstudied$.isSsr && (await unstudied$.request)

const pushToStudy = (word: Word) => {
  if (!toStudy.isSelect) return
  if (toStudy.ids.includes(word._id as string)) {
    toStudy.ids = toStudy.ids.filter((id) => id !== word._id)
  } else {
    toStudy.ids.push(word._id as string)
  }
}

const cancelStudy = () => {
  toStudy.isSelect = false
  toStudy.ids = []
}

const studyWords = async () => {
  const newTerms = toStudy.ids.map((wordId) =>
    api.service('terms').new({ wordId, userId: authStore.user._id }),
  )
  await api.service('terms').create(newTerms as Term[])
  await unstudied$.find()
  toStudy.isSelect = false
  toStudy.ids = []
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  study:
    title: Add new to study set
    select: Select words
    cancel: Cancel
    add: Study
ru:
  study:
    title: Добавить новые слова
    select: Выбрать слова
    cancel: Отмена
    add: Добавить
fi:
  study:
    title: Lisää uusia sanoja
    select: Valitse sanoja
    cancel: Peruuta
    add: Lisää
</i18n>
