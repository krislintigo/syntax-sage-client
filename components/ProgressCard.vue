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
      h4.font-medium.text-base {{ title(t) }}
    el-icon(size='20')
      ElIconArrowRightBold
</template>

<script setup lang="ts">
defineProps<{
  title: (t: any) => string
  color: string
  percentage: number
  count: number
}>()

const { t } = useI18n()
</script>

<style scoped lang="scss"></style>
