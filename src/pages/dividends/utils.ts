import { MONTH_SHORT } from './constants'

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

export const fmtMonth = (key: string) =>
  `${MONTH_SHORT[Number(key.slice(5)) - 1]}/${key.slice(2, 4)}`

export const fmtCompact = (v: number) => {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`
  return `R$${v.toFixed(0)}`
}
