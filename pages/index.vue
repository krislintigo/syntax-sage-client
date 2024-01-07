<template lang="pug">
div
  client-only
    el-dialog(
      v-model='detailDialog.visible',
      width='90%',
      :title='detailDialog.term?.word.original',
      align-center
    )
      .flex.flex-col.gap-y-1
        h3 Matches: {{ detailDialog.term?.studies.match }}
        h3 Audio: {{ detailDialog.term?.studies.audio }}
        h3 Writing: {{ detailDialog.term?.studies.writing }}
  .mb-5
    el-input.mb-3(
      v-model='filter.search',
      :placeholder='t("search")',
      :suffix-icon='ElIconSearch',
      size='large'
    )
    client-only
      template(#fallback)
        el-input(size='large', readonly, placeholder='Categories')
      el-select.w-full(
        v-model='filter.categories',
        placeholder='Categories',
        multiple,
        size='large',
        collapse-tags,
        collapse-tags-tooltip
      )
        el-option(
          v-for='item in CATEGORIES',
          :key='item.value',
          :label='item.title',
          :value='item.value'
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
        // TERMS
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
          @favorite-click='changeFavorite(term)',
          @click='openTermDetail(term)'
        )
      template(v-if='page === "favourites"')
        .border-2.rounded-xl.border-gray-600.p-4.mb-3
          template(v-if='terms$.total >= 2 && favorite$.total >= 1')
            h3.text-xl.text-center.mb-5 Keep learning!
            el-row.gap-x-3(justify='space-between', align='middle')
              h4.w-20 Number of questions
              el-input-number(
                v-model='learnSettings.questions',
                :max='favorite$.total',
                :min='1'
              )
            .my-5
            el-row.gap-x-3(justify='space-between', align='middle')
              h4.w-20 Types of questions
              span Will be available soon...
            .mt-4
            el-row(justify='center')
              el-button.w-full(
                type='primary',
                size='large',
                @click='startLearning'
              ) Start test
          template(v-else)
            h3.text-xl.text-center.px-3 Add more terms to enable testing and continue learning!
        WordCard(
          v-for='term in favorite$.data',
          :key='term._id',
          :word='term.word',
          :favorite='term.favorite',
          @favorite-click='changeFavorite(term)',
          @click='openTermDetail(term)'
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
            :model-value='toStudy.ids.includes(word._id)',
            @click='pushToStudy(word)'
          ) {{  }}
          WordCard.grow(
            :word='word',
            hide-favorite,
            @click='pushToStudy(word)'
          )
  client-only
    span PWA: {{ $pwa }}
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const { t } = useI18n({ useScope: 'local' })
const { api } = useFeathers()
const authStore = useAuthStore()
const testStore = useTestStore()

const page = ref<'terms' | 'favourites' | 'unstudied'>('terms')
const detailDialog = reactive({
  visible: false,
  term: null as Term | null,
})
const toStudy = reactive({
  isSelect: false,
  ids: [] as string[],
})
const filter = reactive({
  search: '',
  categories: [] as string[],
})
const progressStatistics = ref(null)

const learnSettings = reactive({
  questions: 10,
  questionTypes: [
    // 'original-local',
    // 'local-original',
    // 'writing',
    'audio-original',
    'audio-local',
  ] as QuestionType[],
})

const wordJoin = computed(() => filter.search || filter.categories.length)

const termsQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    ...(wordJoin.value && {
      word: {
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
      },
    }),
    $paginate: false,
  },
}))

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

watchEffect(() => {
  progressStatistics.value = createProgressStatistics(terms$.data)
})

const favoriteQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    favorite: true,
    ...(wordJoin.value && {
      word: {
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
      },
    }),
    $paginate: false,
  },
}))

const favorite$ = api
  .service('terms')
  .useFind(favoriteQuery, { paginateOn: 'server' })

favorite$.isSsr && (await favorite$.request)

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

watchEffect(() => {
  learnSettings.questions = Math.min(favorite$.total, 50)
})

const changeFavorite = async ({ _id, favorite }: Term) => {
  const term = api
    .service('terms')
    .getFromStore(_id as string, { clones: true })
  term.value.favorite = !favorite
  await term.value.save()
  term.value.reset()
}

const openTermDetail = (term: Term) => {
  detailDialog.visible = true
  detailDialog.term = term
}

const startLearning = async () => {
  testStore.start({
    numberOfQuestions: learnSettings.questions,
    termsToTest: favorite$.data,
    allTerms: terms$.data,
    questionTypes: learnSettings.questionTypes,
  })
  await navigateTo('/test')
}

const pushToStudy = (word: Word) => {
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

<i18n lang="yaml">
en:
  title: Dictionary
  terms: Terms
  favourites: Favorites
  unstudied: Unstudied
  search: Search in dictionary...
  keepLearning: Keep learning!
  numberOfQuestions: Number of questions
  typesOfQuestions: Types of questions
  startTest: Start test
  studyWords: Study words
  cancel: Cancel
ru:
  title: Словарь
  terms: Термины
  favourites: Избранное
  unstudied: Не изученные
  search: Поиск в словаре...
  keepLearning: Продолжайте учиться!
  numberOfQuestions: Количество вопросов
  typesOfQuestions: Типы вопросов
  startTest: Начать тест
  studyWords: Изучить слова
  cancel: Отмена
fi:
  title: Sanakirja
  terms: Termit
  favourites: Suosikit
  unstudied: Opiskelemattomat
  search: Sanakirjahaku...
  keepLearning: Jatka oppimista!
  numberOfQuestions: Kysymysten määrä
  typesOfQuestions: Kysymysten tyypit
  startTest: Aloita testi
  studyWords: Opiskele sanoja
  cancel: Peruuta
</i18n>
