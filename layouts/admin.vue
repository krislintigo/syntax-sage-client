<template lang="pug">
.m-auto
  el-header
    el-row.px-16(justify='space-between', align='middle')
      h1.mt-6.text-3xl Syntax Sage. Admin
      el-tabs
        el-tab-pane(name='Words')
          template(#label)
            el-icon
              ElIconAddLocation
            span.ml-2.font-normal Words
  el-row(justify='center')
    el-divider(class='!w-11/12 !mb-3')
  el-main
    slot
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
