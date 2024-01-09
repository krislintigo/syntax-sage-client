const getTermStatus = (term: Term): keyof typeof termStatistics => {
  const entries = Object.entries(term.studies)
  const notStudiedFlag = entries.every(([, value]) => value === 0)
  if (notStudiedFlag) return 'notStudied'
  const learningFlag =
    entries.some(([, value]) => value > 0) &&
    entries.some(([, value]) => value < 3)
  if (learningFlag) return 'learning'
  const masteredFlag = entries.every(([, value]) => value >= 3)
  if (masteredFlag) return 'mastered'
  throw new Error('Something went wrong')
}

export const createProgressStatistics = (terms: Term[]) => {
  const statistics = _merge(_cloneDeep(termStatistics), {
    notStudied: { count: 0, percentage: 0 },
    learning: { count: 0, percentage: 0 },
    mastered: { count: 0, percentage: 0 },
  })

  if (!terms.length) return statistics

  for (const term of terms) {
    const status = getTermStatus(term)
    statistics[status].count++
  }

  statistics.notStudied.percentage = Math.round(
    (statistics.notStudied.count / terms.length) * 100,
  )
  statistics.learning.percentage = Math.round(
    (statistics.learning.count / terms.length) * 100,
  )
  statistics.mastered.percentage = Math.round(
    (statistics.mastered.count / terms.length) * 100,
  )
  return statistics
}
