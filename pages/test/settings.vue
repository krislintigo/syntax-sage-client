<template lang="pug">
.h-full
  client-only
    el-dialog(v-model='detailDialog.visible', width='90%', align-center)
      template(#header)
        h3.text-3xl {{ detailDialog.term.word.original }}
      TermDetails(:term='detailDialog.term')
  h2.mb-5.text-center.text-2xl {{ title }}:
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      .border-2.rounded-xl.border-gray-600.p-4.mb-3(
        v-if='learnSettings.questions'
      )
        LearnSettings(
          v-model='learnSettings',
          :test-count='testCount',
          @start='startLearning'
        )
      h3.text-xl.text-center.py-3(v-else) {{ t('study.empty') }}
      .mb-3(v-if='terms$.total')
        h3.text-sm.text-left.mb-3 Choose terms to test (if not selected - all terms will be studied)
        el-button.w-full(
          v-if='!toStudy.isSelect',
          size='large',
          @click='toStudy.isSelect = true'
        ) {{ t('study.select') }}
        el-row.w-full.mt-3(v-else)
          el-button.grow(size='large', @click='cancelStudy') {{ t('study.cancel') }}
      el-row(v-for='term in terms$.data', :key='term._id', align='middle')
        el-checkbox(
          v-if='toStudy.isSelect',
          :model-value='toStudy.ids.includes(term._id)',
          @click='pushToStudy(term)'
        ) {{  }}
        WordCard.grow(
          :word='term.word',
          hide-favorite,
          @click='toStudy.isSelect ? pushToStudy(term) : openTermDetail(term)'
        )
      el-pagination(
        v-model:current-page='terms$.currentPage',
        :total='terms$.total',
        layout='prev, pager, next',
        :hide-on-single-page='terms$.limit === 10'
      )
      el-button.mt-3.my-8(
        size='large',
        type='primary',
        @click='navigateTo("/")'
      ) Back home
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const route = useRoute()
const { t } = useI18n({ useScope: 'local' })
const { api } = useFeathers()
const authStore = useAuthStore()
const testStore = useTestStore()

const learnSettings = reactive({
  questions: 10,
  questionTypes: ['match', 'writing', 'audio'] as (keyof Term['studies'])[],
})
const testCount = ref(0)
const toStudy = reactive({
  isSelect: false,
  ids: [] as string[],
})
const detailDialog = reactive({
  visible: false,
  term: null as Term | null,
})

const target = computed(() => route.query.target as 'learning' | 'mastered')

const title = computed(() => t(`title.${target.value}`))

const query = computed(() => ({
  query: {
    userId: authStore.user._id,
    status: target.value,
    studied: true,
    ...(target.value === 'mastered' && {
      $repeat: true,
    }),
  },
}))

const terms$ = api.service('terms').useFind(query, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

watch(
  [() => terms$.total, () => toStudy.ids.length, () => toStudy.isSelect],
  () => {
    testCount.value = toStudy.isSelect ? toStudy.ids.length : terms$.total
  },
  { immediate: true },
)

watch(testCount, () => {
  learnSettings.questions = toStudy.isSelect ? toStudy.ids.length : 1
})

const pushToStudy = (term: Term) => {
  if (!toStudy.isSelect) return
  if (toStudy.ids.includes(term._id as string)) {
    toStudy.ids = toStudy.ids.filter((id) => id !== term._id)
  } else {
    toStudy.ids.push(term._id as string)
  }
}

const cancelStudy = () => {
  toStudy.isSelect = false
  toStudy.ids = []
}

const openTermDetail = (term: Term) => {
  detailDialog.term = term
  detailDialog.visible = true
}

const startLearning = async () => {
  if (toStudy.isSelect && toStudy.ids.length === 0) {
    ElMessage.warning('Nothing to study')
    return
  }
  const response = await api.service('terms').find({
    query: {
      ...query.value.query,
      ...(toStudy.isSelect && {
        _id: { $in: toStudy.ids },
      }),
      $paginate: false,
    },
  })
  await testStore.start({
    numberOfQuestions: learnSettings.questions,
    termsToTest: response.data as Term[],
    allTermsQuery: { userId: authStore.user._id },
    questionTypes: learnSettings.questionTypes,
  })
  toStudy.isSelect = false
  toStudy.ids = []
  await navigateTo('/test')
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  title:
    learning: Study terms below
    mastered: Repeat mastered terms
  study:
    title: Add new to study set
    select: Select words
    cancel: Cancel
    add: Study
    empty: Add more terms to enable testing and continue learning!
ru:
  title:
    learning: Изучайте термины ниже
    mastered: Повторите выученные термины
  study:
    title: Добавить новые слова
    select: Выбрать слова
    cancel: Отмена
    add: Добавить
    empty: Добавьте больше терминов, чтобы включить тестирование и продолжить обучение!
fi:
  title:
    learning: Opiskele alla olevia termejä
    mastered: Kertaa opittuja sanoja
  study:
    title: Lisää uusia sanoja
    select: Valitse sanat
    cancel: Peruuta
    add: Lisää
    empty: Lisää sanoja suorittaaksesi testit ja jatkaksesi opiskelua!
</i18n>
