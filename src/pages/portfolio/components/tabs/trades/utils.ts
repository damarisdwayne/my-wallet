import type { Trade } from '@/types'

export const tradeLabel = (t: Trade) => {
  if (t.label === 'bonificacao') return 'Bonificação'
  if (t.label === 'amortizacao') return 'Amortização'
  if (t.label === 'desdobramento') return 'Desdobramento'
  if (t.label === 'grupamento') return 'Grupamento'
  if (t.label === 'vencimento') return 'Vencimento'
  return t.type === 'buy' ? 'Compra' : 'Venda'
}

export const tradeColor = (t: Trade) =>
  t.type === 'buy' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'

export const sourceLabel = (t: Trade) =>
  t.source === 'b3_import' ? 'B3' : t.source === 'inter_import' ? 'Inter' : 'Manual'

export type TradeTypeFilter = 'all' | 'buy' | 'sell'

export const monthKey = (date: string) => date.slice(0, 7)

// Distinct YYYY-MM keys, most recent first
export const monthsOf = (dates: string[]) =>
  [...new Set(dates.map(monthKey).filter(Boolean))].sort().reverse()

export const formatMonth = (key: string) => {
  const [year, month] = key.split('-')
  return `${month}/${year}`
}
