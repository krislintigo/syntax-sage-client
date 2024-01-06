// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/css/element-plus.scss" as element;`,
        },
      },
    },
  },
  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'nuxt-feathers-pinia',
    'nuxt-lodash',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/eslint-module',
    '@vite-pwa/nuxt',
  ],
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/icon.svg' }],
      title: 'Syntax Sage',
      htmlAttrs: { class: 'dark' },
    },
  },
  elementPlus: {
    themes: ['dark'],
    importStyle: 'scss',
  },
  css: ['~/assets/css/main.scss', 'element-plus/theme-chalk/src/display.scss'],
  components: {
    global: true,
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },
  eslint: {},
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
  },
  imports: {
    dirs: [
      'composables/**',
      'stores/**',
      'constants/**',
      'utils/**',
      'helpers/**',
    ],
  },
  typescript: {
    shim: false,
  },
  lodash: {
    prefix: '_',
    upperAfterPrefix: false,
  },
  pwa: {
    manifest: {
      name: 'Syntax Sage',
      short_name: 'Syntax Sage',
      theme_color: '#141414',
      background_color: '#141414',
    },
  },
})
