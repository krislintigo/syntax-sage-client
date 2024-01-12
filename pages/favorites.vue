<template lang="pug">
div
  client-only
    el-dialog(v-model='detailDialog.visible', width='90%', align-center)
      template(#header)
        h3.text-3xl {{ detailDialog.term.word.original }}
      TermDetails(:term='detailDialog.term')
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      .border-2.rounded-xl.border-gray-600.p-4.mb-3
        template(v-if='favorite$.total >= 1')
          h3.text-xl.text-center.mb-5 {{ t('settings.title') }}
          el-row.gap-x-3(justify='space-between', align='middle')
            h4.w-20.text-base {{ t('settings.numberOfQuestions') }}
            el-input-number(
              v-model='learnSettings.questions',
              :max='favorite$.total * learnSettings.questionTypes.length',
              :min='1'
            )
          .my-5
          el-row.gap-x-3(justify='space-between', align='middle')
            h4.w-20.text-base {{ t('settings.questionTypes') }}
            el-checkbox-group(v-model='learnSettings.questionTypes')
              el-checkbox-button(label='match')
                el-icon
                  ElIconConnection
              el-checkbox-button(label='writing')
                el-icon
                  ElIconEditPen
              el-checkbox-button(label='audio')
                el-icon
                  ElIconHeadset
          .mt-4
          el-row(justify='center')
            el-button.w-full(
              type='primary',
              size='large',
              @click='startLearning'
            ) {{ t('settings.startTest') }}
        template(v-else)
          h3.text-xl.text-center.px-3 {{ t('settings.addMoreToContinue') }}
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

const { t } = useI18n()
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
  const allTerms = await api
    .service('terms')
    .find({ query: { userId: authStore.user._id, $paginate: false } })
  testStore.start({
    numberOfQuestions: learnSettings.questions,
    termsToTest: favorite$.data as Term[],
    allTerms: allTerms.data as Term[],
    questionTypes: learnSettings.questionTypes,
  })
  await navigateTo('/test')
}

watchEffect(() => {
  learnSettings.questions = Math.min(favorite$.total, 50)
  if (!learnSettings.questionTypes.length) {
    learnSettings.questionTypes = ['match']
  }
})
watchEffect(() => {})
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  settings:
    title: Keep learning!
    addMoreToContinue: Add more terms to enable testing and continue learning!
    numberOfQuestions: Number of questions
    questionTypes: Types of questions
    startTest: Start test
  details:
    learningProgress: Learning progress
    matches: Matches
    audio: Audio
    writing: Writing
    grammarNotes: Grammar notes
ru:
  settings:
    title: Продолжайте учиться!
    addMoreToContinue: Добавьте больше терминов, чтобы включить тестирование и продолжить обучение!
    numberOfQuestions: Количество вопросов
    questionTypes: Типы вопросов
    startTest: Начать тест
  details:
    learningProgress: Прогресс изучения
    matches: Соответствие
    audio: Аудирование
    writing: Написание
    grammarNotes: Грамматические заметки
fi:
  settings:
    title: Jatka opiskelua!
    addMoreToContinue: Lisää sanoja suorittaaksesi testit ja jatkaksesi opiskelua!
    numberOfQuestions: Kysymysmäärä
    questionTypes: Kysymystyypit
    startTest: Aloita testi
  details:
    learningProgress: Oppimisen edistyminen
    matches: Osumat
    audio: Kuuntelu
    writing: Kirjoitus
    grammarNotes: Kielioppihuomautukset
</i18n>
