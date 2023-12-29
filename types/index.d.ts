import { User as _User, Word as _Word, Term as _Term } from 'syntax-sage-server'

declare module 'vue-router' {
  interface RouteMeta {
    permission: 'public' | _User['roles']
  }
}

declare global {
  type User = _User
  type Word = _Word
  type Term = _Term
}

export {}
