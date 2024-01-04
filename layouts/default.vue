<template lang="pug">
.m-auto.h-screen(class='max-w-[500px]')
  el-header
    el-row(align='middle')
      h1.mt-6.text-3xl Syntax Sage
  el-row(justify='center')
    el-divider(class='!w-11/12 !mb-3')
  el-main(class='h-[88%]')
    slot
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
