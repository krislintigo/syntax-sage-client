<template lang="pug">
.h-full
  .h-full.flex.flex-col.justify-between
    .flex.flex-col.gap-y-2
      h2.text-lg.text-center {{ t('title1') }}:
      el-button.my-3(type='danger', size='large', @click='unfavoriteAll') {{ t('removeAll') }}
      h2.mb-3.text-lg.text-center {{ t('title2') }}:
      WordCard(
        v-for='term in testStore.masteredTerms',
        :key='term._id',
        :word='term.word',
        :favorite='term.favorite',
        @favorite-click='changeFavorite(term)'
      )
    el-button.my-4(type='primary', size='large', @click='goHome') {{ t('next') }}
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
  middleware: ['test-setup-middleware'],
})

const { t } = useI18n({ useScope: 'local' })
const { api } = useFeathers()
const testStore = useTestStore()

const changeFavorite = async ({ _id, favorite }: Term) => {
  await api.service('terms').patch(_id as string, { favorite: !favorite })
}

const unfavoriteAll = async () => {
  await Promise.all(
    testStore.masteredTerms.map(({ _id }) =>
      api.service('terms').patch(_id as string, { favorite: false }),
    ),
  )
}

const goHome = async () => {
  await navigateTo('/', { replace: true })
  testStore.reset()
}
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  title1: You successfully mastered terms below. You can now remove them all from your favorites
  title2: or remove only some of them
  removeAll: Unfavorite all
  next: Back home
ru:
  title1: Вы успешно выучили термины ниже. Вы можете удалить их все из избранного
  title2: или удалить только некоторые из них
  removeAll: Удалить все
  next: На главную
fi:
  title1: Olet oppinut alla olevat termit. Voit nyt poistaa ne kaikki suosikeistasi
  title2: tai poistaa vain osan niistä
  removeAll: Poista kaikki
  next: Takaisin etusivulle
</i18n>
