// plugins/1.feathers.ts
import { createClient } from 'syntax-sage-server'
import { OFetch, createPiniaClient } from 'feathers-pinia'

// rest imports for the server
import { $fetch } from 'ofetch'
import rest from '@feathersjs/rest-client'

// socket.io imports for the browser
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'

// other imports
import dayjs from 'dayjs'

/**
 * Creates a Feathers Rest client for the SSR server and a Socket.io client for the browser.
 * Also provides a cookie-storage adapter for JWT SSR using Nuxt APIs.
 */
export default defineNuxtPlugin((nuxt) => {
  const host =
    (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

  // Store JWT in a cookie for SSR.
  const storageKey = 'ss-jwt'
  const jwt = useCookie<string | null>(storageKey, {
    expires: dayjs().add(14, 'days').toDate(),
    secure: true,
    sameSite: 'strict',
  })
  const storage = {
    getItem: () => jwt.value,
    setItem: (_: string, val: string) => (jwt.value = val),
    removeItem: () => (jwt.value = null),
  }

  // Use Rest for the SSR Server and socket.io for the browser
  const connection = process.server
    ? rest(host).fetch($fetch, OFetch)
    : socketio(io(host, { transports: ['websocket'] }))

  const feathersClient = createClient(connection, { storage, storageKey })

  // wrap the feathers client
  const api = createPiniaClient(feathersClient, {
    pinia: nuxt.$pinia,
    ssr: process.server,
    idField: '_id',
    whitelist: [],
    paramsForServer: ['$paginate'],
    skipGetIfExists: true,
    customSiftOperators: {},
    services: {
      users: {
        setupInstance(data) {
          const defaults = {
            roles: [],
          }
          return useInstanceDefaults(defaults, data)
        },
      },
      words: {
        setupInstance(data) {
          const defaults = {
            course: '',
            original: '',
            local: '',
            english: '',

            notes: {
              annotation: '',
              grammar: '',
            },
            categories: [],
          }
          return useInstanceDefaults(defaults, data)
        },
      },
      terms: {
        setupInstance(data) {
          const defaults = {
            favorite: false,
            studies: {
              match: 0,
              audio: 0,
              writing: 0,
            },
            lastStudiedAt: '',
          }
          return useInstanceDefaults(defaults, data)
        },
      },
    },
  })

  return { provide: { api } }
})
