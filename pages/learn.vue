<template lang="pug">
.h-full.flex.flex-col
  h3(v-if='!terms$.data.length') Nothing to repeat
  el-carousel.rounded.grow(
    v-else,
    :autoplay='false',
    :loop='false',
    indicator-position='none',
    arrow='always',
    height='100%'
  )
    el-carousel-item(v-for='(term, i) in terms$.data', :key='term._id')
      .relative.flex.flex-col.justify-center.text-center.h-full(
        @click='flipped[i] = !flipped[i]'
      )
        el-button.absolute.top-3.right-3(
          circle,
          text,
          :type='term.favorite ? "warning" : "info"',
          @click.stop='changeFavorite(term)'
        )
          el-icon(:size='term.favorite ? "25" : "20"')
            component(:is='term.favorite ? ElIconStarFilled : ElIconStar')
        transition(name='el-zoom-in-top')
          div(v-show='!flipped[i]', :key='!flipped[i]')
            h3.text-3xl {{ term.word.original }}
        transition(name='el-zoom-in-bottom')
          div(v-show='flipped[i]', :key='flipped[i]')
            p.text-3xl {{ term.word.local }}
            p.text-xl {{ term.word.english }}
            p.text-lg.text-gray-400 {{ term.word.notes.annotation }}
        //el-row.w-full.bottom-0.p-3(justify='space-between', class='!absolute')
        //  el-button(type='warning', circle, class='!size-14') No
        //  el-button(type='success', circle, class='!size-14') Yes
  el-button.my-5(size='large', type='primary', @click='navigateTo("/")') Finish learning
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const { api } = useFeathers()
const authStore = useAuthStore()

const flipped = ref<boolean[]>([])

const termsQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    studied: true,
    status: 'not-studied',
    $paginate: false,
  },
}))

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

watchEffect(() => {
  flipped.value = terms$.data.map(() => false)
})

const changeFavorite = async ({ _id, favorite }: Term) => {
  await api.service('terms').patch(_id as string, { favorite: !favorite })
}
</script>

<style scoped lang="scss">
.el-carousel__item {
  background-color: #475669;
}
</style>
