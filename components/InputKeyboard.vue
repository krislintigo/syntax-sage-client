<template lang="pug">
.flex.flex-col.gap-y-2.bg-zinc-800.p-1.py-3(class='mx-[-20px]')
  el-row.gap-x-1(v-for='(row, i) in keyboard', :key='i', justify='center')
    template(v-for='(key, j) in row', :key='j')
      template(v-if='key.action === "remove"')
        .flex.justify-center.items-center.bg-gray-600.rounded(
          :style='{ width: letterStyle.width * 1.5 + "px" }',
          @click='input = input.slice(0, -1)'
        )
          Icon(size='25', name='ph:backspace')
      .flex.justify-center.items-center.bg-gray-600.rounded(
        v-else,
        :style='{ width: letterStyle.width + "px" }',
        class='aspect-[2/3]',
        @click='input += key'
      )
        span.leading-none.font-light(
          :class='{ "mb-1": marginLettersToFix.includes(key) }',
          :style='{ fontSize: letterStyle.fontSize + "px" }'
        ) {{ key }}
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const input = defineModel<string>({ required: true })

const keyboard = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '-', { action: 'remove' }],
]
const marginLettersToFix = [
  'q',
  'w',
  'e',
  'r',
  'y',
  'u',
  'o',
  'p',
  'a',
  's',
  'g',
  'z',
  'x',
  'c',
  'v',
  'n',
  'm',
]

const { width } = useWindowSize()

const letterStyle = computed(() => ({
  width: Math.round(Math.min(width.value, 500) / 13),
  fontSize: Math.round(Math.min(width.value, 500) / 18),
}))
</script>

<style scoped lang="scss"></style>
