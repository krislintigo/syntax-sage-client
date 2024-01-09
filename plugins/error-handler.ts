export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error: any) => {
    ElMessage.error(error.message)
    console.error(error, error.data)
  }
})
