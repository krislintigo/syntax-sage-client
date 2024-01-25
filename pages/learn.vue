<template lang="pug">
.h-full.flex.flex-col
  h3(v-if='!terms$.data.length') Nothing to repeat
  .relative.flex.flex-col.justify-center.text-center.h-full.bg-gray-600.rounded.transition-transform(
    v-else-if='term',
    :class='{ slideLeft: isSlideLeft, slideRight: isSlideRight }',
    @click='flipped = !flipped'
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
      div(v-show='!flipped')
        h3.text-3xl {{ term.word.original }}
    transition(name='el-zoom-in-bottom')
      div(v-show='flipped')
        p.text-3xl {{ term.word.local }}
        p.text-xl {{ term.word.english }}
        p.text-lg.text-gray-400 {{ term.word.notes.annotation }}
        .mt-3.ml-3.text-left.border-l-2.rounded-sm(
          v-if='!isEmpty(term.word.notes.grammar)'
        )
          TextEditor(
            :model-value='term.word.notes.grammar',
            target='grammar-notes'
          )
    el-row.w-full.bottom-0.p-3(justify='space-between', class='!absolute')
      el-button(type='warning', circle, class='!size-14', @click.stop='skip')
        el-icon(:size='20')
          ElIconClose
      el-button(type='success', circle, class='!size-14', @click.stop='view(term)')
        el-icon(:size='20')
          ElIconCheck
  el-button.my-5(size='large', type='primary', @click='navigateTo("/")') Finish learning
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  permission: ['student'],
})

const { api } = useFeathers()
const authStore = useAuthStore()

const flipped = ref<boolean>(false)
const isSlideLeft = ref(false)
const isSlideRight = ref(false)

const termsQuery = computed(() => ({
  query: {
    userId: authStore.user._id,
    studied: true,
    viewed: false,
    $limit: 1,
  },
}))

const terms$ = api
  .service('terms')
  .useFind(termsQuery, { paginateOn: 'server' })

terms$.isSsr && (await terms$.request)

const term = computed(() => terms$.data[0])

watchEffect(() => {
  if (terms$.isPending) return
  if (terms$.skip === terms$.total) {
    return navigateTo('/')
  }
})

const changeFavorite = async ({ _id, favorite }: Term) => {
  await api.service('terms').patch(_id as string, { favorite: !favorite })
}

const skip = () => {
  isSlideLeft.value = true
  terms$.skip += 1
  flipped.value = false
  setTimeout(() => {
    isSlideLeft.value = false
  }, 300)
}

const view = async (term: Term) => {
  isSlideRight.value = true
  await api.service('terms').patch(term._id as string, { viewed: true })
  flipped.value = false
  isSlideRight.value = false
}
</script>

<style scoped lang="scss">
.slideLeft {
  transform: translate(-80px, 15px) rotate(-5deg);
}

.slideRight {
  transform: translate(80px, 15px) rotate(5deg);
}
</style>
