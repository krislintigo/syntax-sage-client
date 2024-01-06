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

  type QuestionType = 'original-local' | 'local-original' | 'writing'

  type Question = {
    questionType: QuestionType,
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
