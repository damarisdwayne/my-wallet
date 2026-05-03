import type { Asset, PortfolioCategory } from '@/types'
import type { SortCol } from './constants'

export const isFlatFixedIncome = (a: Asset) => a.type === 'fixed_income'

export const assetNumericValue = (a: Asset, col: SortCol, baseValue: number): number => {
  if (col === 'qty') return a.quantity
  if (col === 'pm') return a.avgPrice
  if (col === 'price') return a.currentPrice
  if (col === 'cost') return a.avgPrice * a.quantity
  if (col === 'total') return a.currentPrice * a.quantity
  if (col === 'ret') {
    const cost = a.avgPrice * a.quantity
    return cost > 0 ? ((a.currentPrice * a.quantity - cost) / cost) * 100 : 0
  }
  if (col === 'pct') return baseValue > 0 ? ((a.currentPrice * a.quantity) / baseValue) * 100 : 0
  return 0
}

export const compareAssets = (
  a: Asset,
  b: Asset,
  col: SortCol,
  dir: 'asc' | 'desc',
  baseValue: number,
  categories: PortfolioCategory[],
): number => {
  if (col === 'ticker') {
    const cmp = a.ticker.localeCompare(b.ticker)
    return dir === 'asc' ? cmp : -cmp
  }
  if (col === 'tipo') {
    const la = categories.find((c) => c.id === a.categoryId)?.name ?? a.type
    const lb = categories.find((c) => c.id === b.categoryId)?.name ?? b.type
    const cmp = la.localeCompare(lb)
    return dir === 'asc' ? cmp : -cmp
  }
  const av = assetNumericValue(a, col, baseValue)
  const bv = assetNumericValue(b, col, baseValue)
  return dir === 'asc' ? av - bv : bv - av
}
