<template lang="pug">
.flex.flex-col.gap-y-2.bg-zinc-800.p-1.py-3(class='mx-[-20px]')
  el-row.gap-x-1(v-for='(row, i) in keyboard', :key='i', justify='center')
    template(v-for='(key, j) in row', :key='j')
      template(v-if='key.action === "backspace"')
        .flex.justify-center.items-center.border.border-zinc-700.rounded(
          :style='{ width: letterStyle.width * 1.5 + "px" }',
          @click='input = input.slice(0, -1)'
        )
          Icon(size='25', name='ph:backspace')
      .flex.justify-center.items-center.border.border-zinc-700.rounded(
        v-else,
        :style='{ width: letterStyle.width + "px" }',
        class='aspect-[2/3]',
        @click='input += key'
      )
        span.leading-none.font-light(
          :style='{ fontSize: letterStyle.fontSize + "px", marginBottom: key.margin + "px" }'
        ) {{ key.letter }}
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const input = defineModel<string>({ required: true })

// const keyboard = [
//   ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å'],
//   ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
//   ['z', 'x', 'c', 'v', 'b', 'n', 'm', '-', { action: 'remove' }],
// ]

const keyboard = [
  [
    { letter: 'q', action: 'letter', margin: 4 },
    { letter: 'w', action: 'letter', margin: 4 },
    { letter: 'e', action: 'letter', margin: 4 },
    { letter: 'r', action: 'letter', margin: 4 },
    { letter: 't', action: 'letter', margin: 4 },
    { letter: 'y', action: 'letter', margin: 4 },
    { letter: 'u', action: 'letter', margin: 4 },
    { letter: 'i', action: 'letter', margin: 4 },
    { letter: 'o', action: 'letter', margin: 4 },
    { letter: 'p', action: 'letter', margin: 4 },
    { letter: 'å', action: 'letter', margin: 4 },
  ],
  [
    { letter: 'a', action: 'letter', margin: 4 },
    { letter: 's', action: 'letter', margin: 4 },
    { letter: 'd', action: 'letter', margin: 4 },
    { letter: 'f', action: 'letter', margin: 4 },
    { letter: 'g', action: 'letter', margin: 4 },
    { letter: 'h', action: 'letter', margin: 4 },
    { letter: 'j', action: 'letter', margin: 4 },
    { letter: 'k', action: 'letter', margin: 4 },
    { letter: 'l', action: 'letter', margin: 4 },
    { letter: 'ö', action: 'letter', margin: 4 },
    { letter: 'ä', action: 'letter', margin: 4 },
  ],
  [
    { letter: 'z', action: 'letter', margin: 4 },
    { letter: 'x', action: 'letter', margin: 4 },
    { letter: 'c', action: 'letter', margin: 4 },
    { letter: 'v', action: 'letter', margin: 4 },
    { letter: 'b', action: 'letter', margin: 4 },
    { letter: 'n', action: 'letter', margin: 4 },
    { letter: 'm', action: 'letter', margin: 4 },
    { letter: '-', action: 'letter', margin: 0 },
    { letter: '', action: 'backspace', margin: 0 },
  ],
]

const { width } = useWindowSize()

const letterStyle = computed(() => ({
  width: Math.round(Math.min(width.value, 500) / 13),
  fontSize: Math.round(Math.min(width.value, 500) / 16),
}))
</script>

<style scoped lang="scss"></style>
