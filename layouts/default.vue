<template lang="pug">
.mx-auto.h-dvh(class='max-w-[500px]')
  el-header(height='50')
    el-row.pt-6(justify='space-between', align='middle')
      h1.text-3xl(@click='reload') Syntax Sage
    el-divider(class='!mb-3')
  el-main(class='h-[86%]')
    slot
</template>

<script setup lang="ts">
const reload = () => location.reload()
</script>

<style scoped lang="scss"></style>
