<template lang="pug">
el-card(shadow='never', class='!border-0')
  el-row(justify='space-between')
    h3.text-2xl {{ word.original }}
    div
      el-button(circle, text, @click.stop='playAudio')
        Icon(name='ion:volume-medium-outline', size='25', color='#909399')
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
    p.italic.text-sm.text-gray-400 {{ word.notes.annotation }}
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
const voiceover = useCookie<Record<string, string>>('voiceover')

const playAudio = () => {
  play(props.word.original, {
    language: 'fi-FI',
    preset: voiceover.value?.['rus-fin'],
  })
}
</script>

<style scoped lang="scss"></style>
