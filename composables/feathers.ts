export const useFeathers = () => {
  const { $api: api } = useNuxtApp()
  return { api }
}
