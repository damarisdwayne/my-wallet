export { formatCompact as fmtCompact, formatMonthYear as fmtMonth } from '@/lib/utils'

export interface MonthBreakdown {
  total: number
  fii: number
  stock: number
  fixed: number
  ext: number
}

export const buildLast12Months = (): string[] => {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}
