<template lang="pug">
el-card(shadow='never', class='!border-0')
  el-row(justify='space-between')
    h3.text-2xl {{ word.original }}
    div
      el-button(circle, text, @click.stop='playAudio')
        el-icon(size='20')
          ElIconMicrophone
      el-button(
        v-if='!hideFavorite',
        circle,
        text,
        :type='favorite ? "warning" : "info"',
        @click.stop='$emit("favorite-click")'
      )
        el-icon(:size='favorite ? "25" : "20"')
          component(:is='favorite ? ElIconStarFilled : ElIconStar')
  p.text-base {{ word.local }}
  el-row.mt-2(justify='space-between')
    p.italic.text-sm.text-gray-400 {{ word.notes }}
    p.italic.text-sm.text-gray-400 {{ word.english }}
</template>

<script setup lang="ts">
const props = defineProps<{
  word: Word
  favorite?: boolean
  hideFavorite?: boolean
}>()

defineEmits<{
  (e: 'favorite-click'): void
}>()

const { play } = useVoiceover()

const playAudio = () => {
  play(props.word.original, { language: 'fi' })
}
</script>

<style scoped lang="scss"></style>
