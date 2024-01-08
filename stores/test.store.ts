export const useTestStore = defineStore('test', () => {
  const progress = ref({
    current: 0,
    total: 0,
  })
  const questions = ref<Question[]>([])

  const start = ({
    numberOfQuestions,
    questionTypes,
    termsToTest,
    allTerms,
  }: {
    numberOfQuestions: number
    termsToTest: Term[]
    allTerms: Term[]
    questionTypes: QuestionType[]
  }) => {
    if (!questionTypes.length) return // at least one

    progress.value = {
      current: 0,
      total: numberOfQuestions,
    }

    const allTestShuffled = _shuffle(termsToTest).slice(0, numberOfQuestions)

    questions.value = allTestShuffled.map((term) => {
      const questionType = questionTypes[_random(0, questionTypes.length - 1)]

      switch (questionType) {
        case 'original-local':
        case 'local-original': {
          const _optionsTerms = _shuffle(allTerms).slice(
            0,
            Math.min(4, allTerms.length),
          )

          const correctTerm = _optionsTerms.find((t) => t._id === term._id)
          const optionsTerms = correctTerm
            ? _optionsTerms
            : _shuffle([
                term,
                ..._optionsTerms.slice(0, _optionsTerms.length - 1),
              ])

          const question =
            questionType === 'original-local'
              ? term.word.original
              : term.word.local
          const correct =
            questionType === 'original-local'
              ? term.word.local
              : term.word.original
          const options = optionsTerms.map((term) => ({
            value:
              questionType === 'original-local'
                ? term.word.local
                : term.word.original,
          }))

          return {
            questionType,
            studyType: 'match',
            originalTerm: term,
            data: { question, correct, options },
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

        // options or/and writing?
        case 'audio-original':
        case 'audio-local': {
          const correct =
            questionType === 'audio-original'
              ? term.word.original
              : term.word.local
          return {
            questionType,
            studyType: 'audio',
            originalTerm: term,
            data: {
              question: term.word.original,
              correct,
              options: [],
            },
            status: {
              answered: false,
              correct: null,
              answer: '',
            },
          }
        }
        default:
          throw new Error('Unknown question type')
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
