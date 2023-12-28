<template lang="pug">
div
  el-row.text-center(justify='space-evenly')
    el-statistic(title='Words added', :value='1242', class='!w-1/3')
    el-statistic(title='Favourites', :value='238', class='!w-1/3')
    el-statistic(title='Categories', :value='64', class='!w-1/3')
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'student',
})
</script>

<style scoped lang="scss"></style>
