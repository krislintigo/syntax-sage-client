<template lang="pug">
el-card(shadow='never', class='!border-0')
  el-row(justify='space-between', align='middle')
    .flex.items-center.gap-x-4
      el-progress(
        type='dashboard',
        :width='60',
        :percentage='statistics.percentage',
        :color='statistics.color'
      )
        template(#default)
          p.font-medium.text-sm {{ statistics.count }}
      h4.font-medium.text-base {{ statistics.title(t) }}
    el-icon(size='20')
      ElIconArrowRightBold
</template>

<script setup lang="ts">
const props = defineProps<{
  status: Term['status']
  query: Record<string, any>
  total: number
}>()

const { t } = useI18n()
const { api } = useFeathers()

const statistics = ref(
  _merge(_cloneDeep(termStatistics[props.status]), { count: 0, percentage: 0 }),
)

const query = computed(() => ({
  query: {
    ...props.query.query,
    status: props.status,
    $limit: 1,
  },
}))

const terms$ = api.service('terms').useFind(query, { paginateOn: 'server' })

watchEffect(() => {
  statistics.value.count = terms$.total
  statistics.value.percentage = props.total
    ? Math.ceil((terms$.total / props.total) * 100)
    : 0
})
</script>

<style scoped lang="scss"></style>
