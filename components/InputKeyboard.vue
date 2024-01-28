<template lang="pug">
.flex.flex-col.gap-y-2.bg-zinc-800.p-1.py-3(class='mx-[-20px]')
  el-row.gap-x-1(v-for='(row, i) in keyboard', :key='i', justify='center')
    template(v-for='(key, j) in row', :key='j')
      template(v-if='key.action === "remove"')
        .flex.justify-center.items-center.h-10.bg-gray-600.rounded(
          :style='{ width: letterWidth * 1.5 + "px" }',
          @click='input = input.slice(0, -1)'
        )
          Icon(size='25', name='ph:backspace')
      .flex.justify-center.items-center.bg-gray-600.rounded(
        v-else,
        :style='{ width: letterWidth + "px" }',
        class='aspect-[3/4]',
        @click='input += key'
      )
        span.leading-none.text-xl {{ key }}
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const input = defineModel<string>({ required: true })

const keyboard = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '-', { action: 'remove' }],
]

const { width } = useWindowSize()

const letterWidth = computed(() => Math.round(width.value / 14))
</script>

<style scoped lang="scss"></style>
