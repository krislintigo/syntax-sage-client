<template lang="pug">
div
  client-only
    el-dialog(v-model='detailDialog.visible', width='90%', align-center)
      template(#header)
        h3.text-3xl {{ detailDialog.term.word.original }}
      TermDetails(:term='detailDialog.term')
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      h3.text-xl.text-center.mb-2 {{ t('settings.title') }}
      .border-2.rounded-xl.border-gray-600.p-4.mb-3(v-if='favorite$.total')
        LearnSettings(
          v-model='learnSettings',
          :test-count='favorite$.total',
          @start='startLearning'
        )
      p.text-base.text-center(v-else) {{ t('settings.empty') }}
      WordCard(
        v-for='term in favorite$.data',
        :key='term._id',
        :word='term.word',
        :favorite='term.favorite',
        @favorite-click='changeFavorite(term)',
        @click='openTermDetail(term)'
      )
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'student',
  permission: ['student'],
})

const { t } = useI18n({ useScope: 'local' })
const { api } = useFeathers()
const authStore = useAuthStore()
const testStore = useTestStore()

const filter = inject('filter') as { search: string; categories: string[] }
const detailDialog = reactive({
  visible: false,
  term: null as Term | null,
})

const learnSettings = reactive({
  questions: 10,
  questionTypes: ['match', 'writing', 'audio'] as (keyof Term['studies'])[],
})

const wordJoin = computed(() => filter.search || filter.categories.length)

const favoriteQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    favorite: true,
    studied: true,
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

const changeFavorite = async ({ _id, favorite }: Term) => {
  await api.service('terms').patch(_id as string, { favorite: !favorite })
}

const openTermDetail = (term: Term) => {
  detailDialog.term = term
  detailDialog.visible = true
}

const startLearning = async () => {
  await testStore.start({
    numberOfQuestions: learnSettings.questions,
    termsToTest: favorite$.data as Term[],
    allTermsQuery: { userId: authStore.user._id },
    questionTypes: learnSettings.questionTypes,
  })
  await navigateTo('/test')
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  settings:
    title: Learn your favorite words!
    empty: You don't have any favorite words yet. Add some to start learning!
ru:
  settings:
    title: Учите любимые слова!
    empty: У вас еще нет любимых слов. Добавьте несколько, чтобы начать учиться!
fi:
  settings:
    title: Opiskele suosikkisanojasi!
    empty: Sinulla ei ole vielä suosikkisanoja. Lisää muutama aloittaaksesi oppimisen!
</i18n>
