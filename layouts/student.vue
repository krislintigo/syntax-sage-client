<template lang="pug">
.mx-auto.h-dvh(class='max-w-[500px]')
  el-header(height='50')
    el-row.pt-6(justify='space-between', align='middle')
      h1.text-3xl(@click='reload') Syntax Sage
      el-avatar(@click='navigateTo("/profile")')
        el-icon
          ElIconUser
    el-divider(class='!mb-3')
  el-main#main(class='h-[88%]')
    .mb-5
      el-input.mb-3(
        v-model='filter.search',
        :placeholder='t("filters.search")',
        :suffix-icon='ElIconSearch',
        size='large'
      )
      client-only
        template(#fallback)
          el-input(
            size='large',
            readonly,
            :placeholder='t("filters.categories")'
          )
        el-select.w-full(
          v-model='filter.categories',
          :placeholder='t("filters.categories")',
          multiple,
          size='large',
          collapse-tags,
          collapse-tags-tooltip
        )
          el-option(
            v-for='item in CATEGORIES',
            :key='item.value',
            :label='item.title($t)',
            :value='item.value'
          )
    el-row.text-center(justify='space-evenly')
      el-col(:span='6')
        el-statistic(
          :title='t("tabs.terms")',
          :value='terms$.total',
          @click='navigate("/")'
        )
        .h-1.bg-blue-500.mt-1.rounded(v-if='route.path === "/"')
      el-col(:span='6')
        el-statistic(
          :title='t("tabs.favourites")',
          :value='favorite$.total',
          @click='navigate("/favorites")'
        )
        .h-1.bg-blue-500.mt-1.rounded(v-if='route.path === "/favorites"')
      el-col(:span='6')
        el-statistic(
          :title='t("tabs.unstudied")',
          :value='unstudied$.total',
          @click='navigate("/unstudied")'
        )
        .h-1.bg-blue-500.mt-1.rounded(v-if='route.path === "/unstudied"')
    el-backtop(target='#main', :visibility-height='2000')
      el-icon.mt-px
        ElIconArrowUpBold
    slot
</template>

<script setup lang="ts">
const { t } = useI18n({ useScope: 'local' })
const { api } = useFeathers()
const route = useRoute()
const authStore = useAuthStore()

const filter = reactive({
  search: '',
  categories: [] as string[],
})

provide('filter', filter)

const reload = () => location.reload()

const termsQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    $limit: 1,
  },
}))

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

const favoriteQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    favorite: true,
    $limit: 1,
  },
}))

const favorite$ = api
  .service('terms')
  .useFind(favoriteQuery, { paginateOn: 'server' })

favorite$.isSsr && (await favorite$.request)

const unstudiedQuery = computed(() => ({
  query: {
    $intersect: authStore.user._id,
    $limit: 1,
  },
}))

const unstudied$ = api
  .service('words')
  .useFind(unstudiedQuery, { paginateOn: 'server' })

unstudied$.isSsr && (await unstudied$.request)

const navigate = (page: string) => {
  navigateTo(`${page}`)
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  filters:
    search: Search in dictionary...
    categories: Categories
  tabs:
    terms: Terms
    favourites: Favorites
    unstudied: Unstudied
ru:
  filters:
    search: Поиск в словаре...
    categories: Категории
  tabs:
    terms: Термины
    favourites: Избранное
    unstudied: Неизученные
fi:
  filters:
    search: Hae sanakirjasta...
    categories: Luokat
  tabs:
    terms: Termit
    favourites: Suosikit
    unstudied: Opiskelemattomat
</i18n>
