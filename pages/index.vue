<template lang="pug">
div
  client-only
    el-dialog(v-model='detailDialog.visible', width='90%', align-center)
      template(#header)
        h3.text-3xl {{ detailDialog.term.word.original }}
      TermDetails(:term='detailDialog.term')
  el-row.mt-8
    el-col.flex.flex-col.gap-y-2
      ProgressCard(
        v-for='status in ["new", "learning", "mastered"]',
        :key='status',
        :status='status',
        :query='termsQuery',
        :total='terms$.total',
        :badge='status === "mastered" ? repeat$.total : null',
        @click='cardClick(status)'
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
      el-pagination(
        v-model:current-page='terms$.currentPage',
        :total='terms$.total',
        layout='prev, pager, next',
        :hide-on-single-page='terms$.limit === 10'
      )
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
  },
}))

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

const repeatQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    status: 'mastered',
    studied: true,
    $repeat: true,
    $limit: 1,
  },
}))

const repeat$ = api
  .service('terms')
  .useFind(repeatQuery, { paginateOn: 'server' })

// test for app badge
watchEffect(() => {
  if (!navigator) return
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(repeat$.total)
  }
})

const cardClick = (key: Term['status']) => {
  switch (key) {
    case 'new':
      navigateTo('/learn')
      break
    case 'learning':
      navigateTo({
        path: '/test/settings',
        query: { target: 'learning' },
      })
      break
    case 'mastered':
      navigateTo({
        path: '/test/settings',
        query: { target: 'mastered' },
      })
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
