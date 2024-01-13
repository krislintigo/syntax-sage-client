export default defineNuxtRouteMiddleware((to) => {
  try {
    const authStore = useAuthStore()

    if (to.meta.permission === 'public') return
    if (!authStore.isAuthenticated) return navigateTo('/login')

    // ROLES
    const userRoles = authStore.user.roles as User['roles']
    const allowedRoles = to.meta.permission
    if (userRoles.includes('system-admin')) return
    if (!_intersection(userRoles, allowedRoles).length) {
      return navigateTo('/login')
    }
  } catch (e: any) {
    return navigateTo('/login')
  }
})
