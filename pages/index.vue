<template lang="pug">
div
  el-input.mb-5(
    v-model='filter.search',
    placeholder='Search in dictionary...',
    :suffix-icon='ElIconSearch',
    size='large'
  )
  el-row.text-center(justify='space-evenly')
    el-col(:span='6')
      el-statistic(
        title='Terms',
        :value='terms$.total',
        @click='page = "terms"'
      )
      .bg-blue-500.h-px.mt-1(v-if='page === "terms"')
    el-col(:span='6')
      el-statistic(
        title='Favorites',
        :value='favorite$.total',
        @click='page = "favourites"'
      )
      .bg-blue-500.h-px.mt-1(v-if='page === "favourites"')
    el-col(:span='6')
      el-statistic(
        title='Unstudied',
        :value='unstudied$.total',
        @click='page = "unstudied"'
      )
      .bg-blue-500.h-px.mt-1(v-if='page === "unstudied"')
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      template(v-if='page === "terms"')
        template(v-if='progressStatistics')
          ProgressCard(
            v-for='(stat, key) in progressStatistics',
            :key='key',
            :title='stat.title',
            :count='stat.count',
            :percentage='stat.percentage',
            :color='stat.color'
          )
        el-divider
        WordCard(
          v-for='term in terms$.data',
          :key='term._id',
          :word='term.word',
          :favorite='term.favorite',
          @favorite-click='changeFavorite(term)'
        )
      template(v-if='page === "favourites"')
        WordCard(
          v-for='term in favorite$.data',
          :key='term._id',
          :word='term.word',
          :favorite='term.favorite',
          @favorite-click='changeFavorite(term)'
        )
      template(v-if='page === "unstudied"')
        // UNSTUDIED
        el-button.w-full(
          v-if='!toStudy.isSelect',
          size='large',
          @click='toStudy.isSelect = true'
        ) Study words
        el-row(v-else)
          el-button.grow(size='large', @click='cancelStudy') Cancel
          el-button.grow(size='large', @click='studyWords') Study
        .mt-4
        el-row(
          v-for='word in unstudied$.data',
          :key='word._id',
          align='middle'
        )
          el-checkbox(
            v-if='toStudy.isSelect',
            :model-value='toStudy.ids.includes(word._id)'
          ) {{  }}
          WordCard.grow(:word='word', @click='cardClickHandler(word)')
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const { api } = useFeathers()
const authStore = useAuthStore()

const page = ref<'terms' | 'favourites' | 'unstudied'>('terms')
const toStudy = reactive({
  isSelect: false,
  ids: [] as string[],
})
const filter = reactive({
  search: '',
})
const progressStatistics = ref(null)

const termsQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    // ...(filter.search && {
    //   $or: [
    //     { original: { $regex: filter.search, $options: 'i' } },
    //     { english: { $regex: filter.search, $options: 'i' } },
    //     { local: { $regex: filter.search, $options: 'i' } },
    //   ],
    // }),
    $limit: 100,
  },
}))

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

watchEffect(() => {
  progressStatistics.value = createProgressStatistics(terms$.data)
})

const favoriteQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    favorite: true,
    // ...(filter.search && {
    //   $or: [
    //     { original: { $regex: filter.search, $options: 'i' } },
    //     { english: { $regex: filter.search, $options: 'i' } },
    //     { local: { $regex: filter.search, $options: 'i' } },
    //   ],
    // }),
    $limit: 100,
  },
}))

const favorite$ = api
  .service('terms')
  .useFind(favoriteQuery, { paginateOn: 'server' })

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
    $limit: 100,
  },
}))

const unstudied$ = api
  .service('words')
  .useFind(unstudiedQuery, { paginateOn: 'server' })

const changeFavorite = async ({ _id, favorite }: Term) => {
  const term = api
    .service('terms')
    .getFromStore(_id as string, { clones: true })
  term.value.favorite = !favorite
  await term.value.save()
  term.value.reset()
}

const cardClickHandler = (word: Word) => {
  if (!toStudy.isSelect) return
  if (toStudy.ids.includes(word._id)) {
    toStudy.ids = toStudy.ids.filter((id) => id !== word._id)
  } else {
    toStudy.ids.push(word._id)
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
  await Promise.all(newTerms.map((term) => term.save()))
  await unstudied$.find()
  toStudy.isSelect = false
  toStudy.ids = []
}
</script>

<style scoped lang="scss"></style>
