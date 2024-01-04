export const useTestStore = defineStore('test', () => {
  const progress = ref({
    current: 0,
    total: 0,
  })
  const questions = ref<any[]>([])

  const start = (options: {
    questions: number
    termsToTest: Term[]
    allTerms: Term[]
    questionTypes: Array<'original-local' | 'local-original'>
  }) => {
    progress.value = {
      current: 0,
      total: options.questions,
    }

    const allTestShuffled = _shuffle(options.termsToTest).slice(
      0,
      options.questions,
    )

    questions.value = allTestShuffled.map((term) => {
      const _optionsTerms = _shuffle(options.allTerms).slice(
        0,
        Math.min(4, options.allTerms.length),
      )

      const correctTerm = _optionsTerms.find((t) => t._id === term._id)
      const optionsTerms = correctTerm
        ? _optionsTerms
        : _shuffle([term, ..._optionsTerms.slice(0, _optionsTerms.length - 1)])

      return {
        questionType: 'original-local',
        studyType: 'match',
        originalTerm: term,
        data: {
          question: term.word.original,
          correct: term.word.local,
          options: optionsTerms.map((term) => ({
            value: term.word.local,
          })),
        },
      }
    })
  }

  return { progress, questions, start }
})
