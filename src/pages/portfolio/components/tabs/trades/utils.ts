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

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export const formatMonthName = (key: string) => MONTH_NAMES[Number(key.slice(5, 7)) - 1] ?? key

export const formatMonth = (key: string) => `${formatMonthName(key)} ${key.slice(0, 4)}`

// Groups YYYY-MM keys by year, preserving the input order
export const groupMonthsByYear = (months: string[]) => {
  const map = new Map<string, string[]>()
  for (const m of months) {
    const year = m.slice(0, 4)
    map.set(year, [...(map.get(year) ?? []), m])
  }
  return [...map.entries()].map(([year, items]) => ({ year, months: items }))
}

export interface DayGroup<T> {
  date: string
  items: T[]
}

// Most recent day first; items keep the order given by `compare` inside each day
export const groupByDay = <T>(
  items: T[],
  dateOf: (item: T) => string,
  compare: (a: T, b: T) => number = () => 0,
): DayGroup<T>[] => {
  const sorted = [...items].sort((a, b) => dateOf(b).localeCompare(dateOf(a)) || compare(a, b))
  const map = new Map<string, T[]>()
  for (const item of sorted) {
    const date = dateOf(item)
    map.set(date, [...(map.get(date) ?? []), item])
  }
  return [...map.entries()].map(([date, dayItems]) => ({ date, items: dayItems }))
}

const buysFirst = (a: Trade, b: Trade) => (a.type === b.type ? 0 : a.type === 'buy' ? -1 : 1)

export const groupTradesByDay = (trades: Trade[]) => groupByDay(trades, (t) => t.date, buysFirst)
