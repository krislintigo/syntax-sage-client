import type { ServiceInstance } from 'feathers-pinia'
import { User as _User, Word as _Word, Term as _Term } from 'syntax-sage-server'

declare module 'vue-router' {
  interface RouteMeta {
    permission: 'public' | _User['roles']
  }
}

declare global {
  type User = ServiceInstance<_User> & _User
  type Word = ServiceInstance<_Word> & _Word
  type Term = ServiceInstance<_Term> & _Term

  type QuestionType = ('match' | 'writing' | 'audio' | 'original' | 'local' | 'options' | 'input')[]

  type Question = {
    type: QuestionType,
    studyType: keyof Term['studies'],
    originalTerm: Term,
    data: {
      question: string,
      correct: string,
      options: Array<{ value: string }>
    },
    status: {
      answered: boolean,
      correct: boolean | null,
      answer: string
    }
  }
}

export {}
