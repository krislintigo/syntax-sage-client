<template lang="pug">
.h-full
  h2.mb-5.text-center.text-2xl {{ title }}:
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      .border-2.rounded-xl.border-gray-600.p-4.mb-3
        LearnSettings(
          v-model='learnSettings',
          :count='terms$.total',
          @start='startLearning'
        )
      WordCard(
        v-for='term in terms$.data',
        :key='term._id',
        :word='term.word',
        hide-favorite
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

const target = computed(() => route.query.target)

const title = computed(() => t(`title.${target.value}`))

const query = computed(() => ({
  query: {
    userId: authStore.user._id,
    status: target.value,
    studied: true,
    ...(target.value === 'mastered' && {
      $repeat: true,
    }),
    $paginate: false,
  },
}))

const terms$ = api.service('terms').useFind(query, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

const startLearning = async () => {
  const allTerms = await api
    .service('terms')
    .find({ query: { userId: authStore.user._id, $paginate: false } })
  testStore.start({
    numberOfQuestions: learnSettings.questions,
    termsToTest: terms$.data as Term[],
    allTerms: allTerms.data as Term[],
    questionTypes: learnSettings.questionTypes,
  })
  await navigateTo('/test')
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  title:
    learning: 'Study terms below'
    mastered: 'Repeat mastered terms'
ru:
  title:
    learning: 'Study terms below'
    mastered: 'Repeat mastered terms'
fi:
  title:
    learning: 'Study terms below'
    mastered: 'Repeat mastered terms'
</i18n>
