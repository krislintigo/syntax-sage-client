<template lang="pug">
.flex.flex-col.gap-y-2.bg-zinc-800.p-1.py-3(class='mx-[-20px]')
  .grid.gap-x-1(
    v-for='(row, i) in FINNISH_KEYBOARD.keys',
    :key='i',
    :style='{ gridTemplateColumns: `repeat(${FINNISH_KEYBOARD.cols}, minmax(0, 1fr))` }'
  )
    template(v-for='(key, j) in row', :key='j')
      template(v-if='key.action === "uppercase"')
        .flex.justify-center.items-center.bg-zinc-600.rounded(
          :style='key.grid'
        )
          Icon(size='25', name='fluent:keyboard-shift-uppercase-16-regular')

      template(v-else-if='key.action === "backspace"')
        .flex.justify-center.items-center.bg-zinc-600.rounded(
          :style='key.grid',
          @click='input = input.slice(0, -1)'
        )
          Icon(size='25', name='ph:backspace')

      template(v-else-if='key.action === "space"')
        .flex.justify-center.items-center.bg-zinc-600.rounded(
          :style='key.grid',
          @click='input += " "'
        )
          Icon(size='25', name='tabler:space')

      template(v-else-if='key.action === "enter"')
        .flex.justify-center.items-center.bg-zinc-600.rounded(
          :style='key.grid',
          @click='$emit("enter")'
        )
          Icon(size='25', name='uil:enter')

      .flex.justify-center.items-center.bg-zinc-600.shadow.rounded.col-span-2(
        v-else,
        class='aspect-[2/3]',
        :style='key.grid',
        @click='input += key.letter'
      )
        span.leading-none.font-light(
          :style='{ fontSize: letterStyle.fontSize + "px", marginBottom: key.margin + "px" }'
        ) {{ key.letter }}
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

defineEmits<{ (e: 'enter'): void }>()

const input = defineModel<string>({ required: true })

const { width } = useWindowSize()

const letterStyle = computed(() => ({
  width: Math.round(Math.min(width.value, 500) / 13) - 1,
  fontSize: Math.round(Math.min(width.value, 500) / 16),
}))
</script>

<style scoped lang="scss"></style>
