<template lang="pug">
.flex.flex-col.bg-zinc-800.p-1.py-3(
  :class='["mx-[-20px]", spacing.row]',
  @mouseleave='pressed = false',
  @mouseup='pressed = false'
)
  .grid(
    v-for='(row, i) in FINNISH_KEYBOARD.keys',
    :key='i',
    :style='{ gridTemplateColumns: `repeat(${FINNISH_KEYBOARD.cols}, minmax(0, 1fr))` }',
    :class='[spacing.col]'
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
        tabindex='0',
        @mousedown='pressed = true',
        @mouseover='onMouseover(key)',
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
const pressed = ref(false)

const { width } = useWindowSize()

const letterStyle = computed(() => ({
  width: Math.round(Math.min(width.value, 500) / 13) - 1,
  fontSize: Math.round(Math.min(width.value, 500) / 16),
}))

const spacing = computed(() => {
  const w = Math.min(width.value, 500)
  if (w < 300)
    return {
      row: 'gap-y-2',
      col: 'gap-x-1',
    }
  if (w < 400)
    return {
      row: 'gap-y-2.5',
      col: 'gap-x-1.5',
    }
  return {
    row: 'gap-y-3',
    col: 'gap-x-2',
  }
})

const onMouseover = (key: any) => {
  if (pressed.value) {
    console.log(key.letter)
  }
}
</script>

<style scoped lang="scss"></style>
