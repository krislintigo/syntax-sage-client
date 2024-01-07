<template lang="pug">
.m-auto.h-screen(class='max-w-[500px]')
  el-header(height='50')
    el-row.mt-6(justify='space-between', align='middle')
      h1.text-3xl Syntax Sage
      el-avatar(@click='navigateTo("/profile")')
        el-icon
          ElIconUser
  el-row(justify='center')
    el-divider(class='!w-11/12 !mb-3')
  el-main(class='h-[88%]')
    slot
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
