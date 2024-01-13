export default defineNuxtRouteMiddleware(() => {
  const testStore = useTestStore()
  if (!testStore.questions.length) {
    return navigateTo('/', { replace: true })
  }
})
