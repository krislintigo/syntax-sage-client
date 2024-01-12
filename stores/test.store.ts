const generateOptions = (
  term: Term,
  allTerms: Term[],
  variant: 'original' | 'local',
) => {
  const _optionsTerms = _shuffle(allTerms).slice(
    0,
    Math.min(4, allTerms.length),
  )

  const correctTerm = _optionsTerms.find((t) => t._id === term._id)
  const optionsTerms = correctTerm
    ? _optionsTerms
    : _shuffle([term, ..._optionsTerms.slice(0, _optionsTerms.length - 1)])

  return optionsTerms.map((term) => ({
    value: variant === 'original' ? term.word.local : term.word.original,
  }))
}

export const useTestStore = defineStore('test', () => {
  const progress = ref({
    current: 0,
    total: 0,
  })
  const questions = ref<Question[]>([])

  const start = ({
    numberOfQuestions, // not more than 3 for each term
    questionTypes,
    termsToTest,
    allTerms,
  }: {
    numberOfQuestions: number
    termsToTest: Term[]
    allTerms: Term[]
    questionTypes: (keyof Term['studies'])[]
  }) => {
    if (!questionTypes.length) return

    progress.value = {
      current: 0,
      total: numberOfQuestions,
    }
    questions.value = []

    const termsWithCoefficients = termsToTest
      .map((term) => {
        const total = Object.values(term.studies).reduce(
          (acc, cur) => acc + cur,
          0,
        )
        return { term, coefficient: total }
      })
      .sort((a, b) => a.coefficient - b.coefficient)

    const repeatTimes = Math.ceil(numberOfQuestions / termsToTest.length)
    const ids = _times(repeatTimes, () => _range(termsToTest.length))
      .flat(1)
      .slice(0, numberOfQuestions)

    const allTest = ids.map((id) => termsWithCoefficients[id].term)

    for (const term of allTest) {
      const sameTerms = questions.value.filter(
        (q) => q.originalTerm._id === term._id,
      )
      const usedQuestionTypes = sameTerms.map((q) => q.studyType)
      const questionTypesToUse = _difference(questionTypes, usedQuestionTypes)
      if (!questionTypesToUse.length) throw new Error('Nothing to use')

      const filteredStudies = _pick(term.studies, questionTypesToUse)
      const [studyType] = _minBy(
        _shuffle(Object.entries(filteredStudies)),
        ([, value]) => value,
      )!

      const status = {
        answered: false,
        correct: null,
        answer: '',
      }
      switch (studyType) {
        case 'match': {
          const variant = _sample(['original', 'local'] as const)
          const select = 'options'

          const question =
            variant === 'original' ? term.word.original : term.word.local
          const correct =
            variant === 'original' ? term.word.local : term.word.original
          const options = generateOptions(term, allTerms, variant)

          questions.value.push({
            type: [studyType, variant, select],
            studyType,
            originalTerm: term,
            data: { question, correct, options },
            status,
          })
          break
        }
        case 'writing': {
          const variant = 'local'
          const select = 'input'

          questions.value.push({
            type: [studyType, variant, select],
            studyType,
            originalTerm: term,
            data: {
              question: term.word.local,
              correct: term.word.original,
              options: [],
            },
            status,
          })
          break
        }
        case 'audio': {
          const variant = 'original'
          const select = _sample(['options', 'input'] as const)

          const correct =
            select === 'options' ? term.word.local : term.word.original
          const options =
            select === 'options' ? generateOptions(term, allTerms, variant) : []

          questions.value.push({
            type: [studyType, variant, select],
            studyType,
            originalTerm: term,
            data: {
              question: term.word.original,
              correct,
              options,
            },
            status,
          })
          break
        }
      }
    }

    questions.value = _shuffle(questions.value)
  }

  const answer = (answer: string) => {
    const question = questions.value[progress.value.current]
    const isCorrect =
      question.data.correct.toLowerCase() === answer.trim().toLowerCase()

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
