<template lang="pug">
el-card(shadow='never', class='!border-0')
  el-row(justify='space-between', align='middle')
    .flex.items-center.gap-x-4
      el-progress(
        type='dashboard',
        :width='60',
        :percentage='percentage',
        :color='color'
      )
        template(#default)
          p.font-medium.text-sm {{ count }}
      h4.font-medium {{ title }}
    el-icon(size='20')
      ElIconArrowRightBold
</template>

<script setup lang="ts">
defineProps<{
  title: string
  color: string
  percentage: number
  count: number
}>()
</script>

<style scoped lang="scss"></style>
