export const useTestStore = defineStore('test', () => {
  const progress = ref({
    current: 0,
    total: 0,
  })
  const questions = ref<Question[]>([])

  const start = (options: {
    questions: number
    termsToTest: Term[]
    allTerms: Term[]
    questionTypes: QuestionType[]
  }) => {
    if (!options.questionTypes.length) return // at least one

    progress.value = {
      current: 0,
      total: options.questions,
    }

    const allTestShuffled = _shuffle(options.termsToTest).slice(
      0,
      options.questions,
    )

    questions.value = allTestShuffled.map((term) => {
      const questionType =
        options.questionTypes[_random(0, options.questionTypes.length - 1)]

      switch (questionType) {
        case 'original-local': {
          const _optionsTerms = _shuffle(options.allTerms).slice(
            0,
            Math.min(4, options.allTerms.length),
          )

          const correctTerm = _optionsTerms.find((t) => t._id === term._id)
          const optionsTerms = correctTerm
            ? _optionsTerms
            : _shuffle([
                term,
                ..._optionsTerms.slice(0, _optionsTerms.length - 1),
              ])

          return {
            questionType,
            studyType: 'match',
            originalTerm: term,
            data: {
              question: term.word.original,
              correct: term.word.local,
              options: optionsTerms.map((term) => ({
                value: term.word.local,
              })),
            },
            status: {
              answered: false,
              correct: null,
              answer: '',
            },
          }
        }
        case 'local-original': {
          const _optionsTerms = _shuffle(options.allTerms).slice(
            0,
            Math.min(4, options.allTerms.length),
          )

          const correctTerm = _optionsTerms.find((t) => t._id === term._id)
          const optionsTerms = correctTerm
            ? _optionsTerms
            : _shuffle([
                term,
                ..._optionsTerms.slice(0, _optionsTerms.length - 1),
              ])

          return {
            questionType,
            studyType: 'match',
            originalTerm: term,
            data: {
              question: term.word.local,
              correct: term.word.original,
              options: optionsTerms.map((term) => ({
                value: term.word.original,
              })),
            },
            status: {
              answered: false,
              correct: null,
              answer: '',
            },
          }
        }
        case 'writing': {
          return {
            questionType,
            studyType: 'writing',
            originalTerm: term,
            data: {
              question: term.word.local,
              correct: term.word.original,
              options: [],
            },
            status: {
              answered: false,
              correct: null,
              answer: '',
            },
          }
        }
      }
    })
  }

  const answer = (answer: string) => {
    const question = questions.value[progress.value.current]
    const isCorrect = question.data.correct === answer

    question.status.answered = true
    question.status.correct = isCorrect
    question.status.answer = answer
  }

  const reset = () => {
    progress.value = { current: 0, total: 0 }
    questions.value = []
  }

  return { progress, questions, start, answer, reset }
})
