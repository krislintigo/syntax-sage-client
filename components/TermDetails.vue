<template lang="pug">
.flex.flex-col.gap-y-1
  h3.mt-3.text-lg {{ t('details.learningProgress') }}:
  .flex.flex-col.gap-y-1.ml-3
    h3.text-base {{ t('details.matches') }}: {{ term.studies.match }}
    h3.text-base {{ t('details.writing') }}: {{ term.studies.writing }}
    h3.text-base {{ t('details.audio') }}: {{ term.studies.audio }}
  .mt-3.border-l.rounded-sm(v-if='!isEmpty(term.word.notes.grammar)')
    TextEditor(:model-value='term.word.notes.grammar', target='grammar-notes')
</template>

<script setup lang="ts">
defineProps<{ term: Term }>()

const { t } = useI18n({ useScope: 'local' })
</script>

<style scoped lang="scss"></style>

<i18n lang="yaml">
en:
  details:
    learningProgress: Learning progress
    matches: Matches
    audio: Audio
    writing: Writing
    grammarNotes: Grammar notes
ru:
  details:
    learningProgress: Прогресс изучения
    matches: Соответствие
    audio: Аудирование
    writing: Написание
    grammarNotes: Грамматические заметки
fi:
  details:
    learningProgress: Oppimisen edistyminen
    matches: Osumat
    audio: Kuuntelu
    writing: Kirjoitus
    grammarNotes: Kielioppihuomautukset
</i18n>
