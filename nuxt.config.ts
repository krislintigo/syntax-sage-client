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
    'nuxt-icon',
    '@nuxtjs/eslint-module',
    '@vite-pwa/nuxt',
  ],
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/icon.svg' }],
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
          'data-meta-dynamic': 'true',
        },
      ],
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
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.yaml' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.yaml' },
      { code: 'fi', iso: 'fi-FI', file: 'fi.yaml' },
    ],
    strategy: 'no_prefix',
    defaultLocale: 'en',
    langDir: 'locales/',
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
      theme_color: '#000',
      background_color: '#0a0a0a',
      // icons: [],
      description: 'Application for studying words by courses and categories.',
      categories: ['education', 'productivity'],
      orientation: 'portrait-primary',
      // display_override: ['minimal-ui', 'window-controls-overlay'],
      // display: 'minimal-ui', // ?
      screenshots: [
        {
          src: '/screenshots/screenshot-1.png',
          type: 'image/png',
          sizes: '1179x2556',
          form_factor: 'narrow',
        },
        {
          src: '/screenshots/screenshot-2.png',
          type: 'image/png',
          sizes: '2348x1890',
          form_factor: 'wide',
        },
      ],
    },
  },
})
