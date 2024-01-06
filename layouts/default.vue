<template lang="pug">
.m-auto.h-screen(class='max-w-[500px]')
  el-header
    el-row(align='middle')
      h1.mt-6.text-3xl Syntax Sage
      //client-only
      //  el-select.w-24(v-model='locale')
      //    el-option(label='ENG', value='en')
      //    el-option(label='RUS', value='ru')
      //    el-option(label='FIN', value='fi')
  el-row(justify='center')
    el-divider(class='!w-11/12 !mb-3')
  el-main(class='h-[88%]')
    slot
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n({ useScope: 'local' })

watchEffect(() => setLocale(locale.value))
</script>

<style scoped lang="scss"></style>
