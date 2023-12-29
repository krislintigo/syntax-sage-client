export const createProgressStatistics = (terms: Term[]) => {
  const statistics = _merge(_cloneDeep(termStatistics), {
    notStudied: { count: 0, percentage: 0 },
    learning: { count: 0, percentage: 0 },
    mastered: { count: 0, percentage: 0 },
  })
  const notStudiedTerms = terms.reduce((acc, term) => {
    const entries = Object.entries(term.studies)
    const flag = entries.some(([, value]) => value === 0)
    return flag ? acc + 1 : acc
  }, 0)
  const learningTerms = terms.reduce((acc, term) => {
    const entries = Object.entries(term.studies)
    const subFlag = entries.every(([, value]) => value !== 0)
    const mainFlag = entries.some(([, value]) => value > 0 && value < 3)
    return mainFlag && subFlag ? acc + 1 : acc
  }, 0)
  const masteredTerms = terms.reduce((acc, term) => {
    const entries = Object.entries(term.studies)
    const flag = entries.every(([, value]) => value >= 3)
    return flag ? acc + 1 : acc
  }, 0)

  statistics.notStudied.count = notStudiedTerms
  statistics.notStudied.percentage = terms.length
    ? Math.round((notStudiedTerms / terms.length) * 100)
    : 0
  statistics.learning.count = learningTerms
  statistics.learning.percentage = terms.length
    ? Math.round((learningTerms / terms.length) * 100)
    : 0
  statistics.mastered.count = masteredTerms
  statistics.mastered.percentage = terms.length
    ? Math.round((masteredTerms / terms.length) * 100)
    : 0
  return statistics
}
