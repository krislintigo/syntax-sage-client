// stores/auth.ts
import { acceptHMRUpdate, defineStore } from 'pinia'

interface AuthenticateData {
  strategy: 'local' | 'jwt'
  login: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const { api } = useFeathers()
  return useAuth<AuthenticateData>({ api, servicePath: 'users' })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
