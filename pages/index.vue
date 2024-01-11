<template lang="pug">
div
  client-only
    el-dialog(v-model='detailDialog.visible', width='90%', align-center)
      template(#header)
        h3.text-3xl {{ detailDialog.term.word.original }}
      TermDetails(:term='detailDialog.term')
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      template(v-if='progressStatistics')
        ProgressCard(
          v-for='(stat, key) in progressStatistics',
          :key='key',
          :title='stat.title',
          :count='stat.count',
          :percentage='stat.percentage',
          :color='stat.color',
          @click='cardClick(key)'
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
  client-only
    span PWA: {{ $pwa }}
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'student',
  permission: ['student'],
})

const { api } = useFeathers()
const authStore = useAuthStore()

const filter = inject('filter') as { search: string; categories: string[] }
const detailDialog = reactive({
  visible: false,
  term: null as Term | null,
})
const progressStatistics = ref<any>(null)

const wordJoin = computed(() => filter.search || filter.categories.length)

const termsQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
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

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

watchEffect(() => {
  const mapper = {
    'not-studied': 'notStudied',
    learning: 'learning',
    mastered: 'mastered',
  }

  progressStatistics.value = _merge(_cloneDeep(termStatistics), {
    notStudied: { count: 0, percentage: 0 },
    learning: { count: 0, percentage: 0 },
    mastered: { count: 0, percentage: 0 },
  })

  if (!terms$.data.length) return

  for (const term of terms$.data) {
    progressStatistics.value[mapper[term.status]].count++
  }

  progressStatistics.value.notStudied.percentage = Math.round(
    (progressStatistics.value.notStudied.count / terms$.data.length) * 100,
  )
  progressStatistics.value.learning.percentage = Math.round(
    (progressStatistics.value.learning.count / terms$.data.length) * 100,
  )
  progressStatistics.value.mastered.percentage = Math.round(
    (progressStatistics.value.mastered.count / terms$.data.length) * 100,
  )
})

const cardClick = (key: string) => {
  switch (key) {
    case 'notStudied':
      navigateTo('/learn')
      break
    case 'learning':
      ElMessage.warning('Feature not implemented yet')
      break
    case 'mastered':
      ElMessage.warning('Feature not implemented yet')
      break
  }
}

const changeFavorite = async ({ _id, favorite }: Term) => {
  await api.service('terms').patch(_id as string, { favorite: !favorite })
}

const openTermDetail = (term: Term) => {
  detailDialog.term = term
  detailDialog.visible = true
}
</script>

<style scoped lang="scss"></style>
