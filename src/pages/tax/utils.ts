const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${MONTH_LABELS[Number(m) - 1]}/${y}`
}

export const darfDeadline = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  const next = new Date(y, m, 0)
  next.setMonth(next.getMonth() + 1)
  while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() - 1)
  return next.toLocaleDateString('pt-BR')
}
