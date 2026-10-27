export type Period = 'refresh' | '7' | '30'

export const PERIODS: { value: Period; label: string }[] = [
  { value: 'refresh', label: 'Última atualização' },
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
]

export const periodDays = (period: Period): number | null =>
  period === 'refresh' ? null : Number(period)
