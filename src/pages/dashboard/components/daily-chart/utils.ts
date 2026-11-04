import type { DailyPatrimonyPoint } from '@/services/patrimony'

export type DailyRange = '1M' | '3M' | '1A' | 'MAX'
export const DAILY_RANGES: DailyRange[] = ['1M', '3M', '1A', 'MAX']

const RANGE_DAYS: Record<Exclude<DailyRange, 'MAX'>, number> = { '1M': 30, '3M': 91, '1A': 365 }

export interface DailyChartPoint {
  date: string
  value: number
  /** Accumulated return in the range (%), contributions excluded. */
  returnPct: number
  /** Market move of the day in BRL, contributions excluded. */
  dayChange: number
  dayChangePct: number
}

interface IndexedPoint extends DailyPatrimonyPoint {
  index: number
  dayChange: number
  dayChangePct: number
}

export const mergeToday = (
  history: DailyPatrimonyPoint[],
  today: DailyPatrimonyPoint,
): DailyPatrimonyPoint[] => {
  if (today.value <= 0) return history
  const rest = history.filter((p) => p.date !== today.date)
  return [...rest, today]
}

// Time-weighted index: contributions (cost delta) are removed from each day's move,
// so a monthly aporte never hides a market drop.
const toIndexed = (points: DailyPatrimonyPoint[]): IndexedPoint[] => {
  let index = 1
  return points.map((p, i) => {
    const prev = points[i - 1]
    if (!prev || prev.value <= 0) return { ...p, index, dayChange: 0, dayChangePct: 0 }
    const flow = p.cost - prev.cost
    const dayChange = p.value - prev.value - flow
    const dayChangePct = (dayChange / prev.value) * 100
    index *= 1 + dayChange / prev.value
    return { ...p, index, dayChange, dayChangePct }
  })
}

const rangeStart = (range: DailyRange, lastDate: string) => {
  if (range === 'MAX') return ''
  const d = new Date(lastDate + 'T12:00:00')
  d.setDate(d.getDate() - RANGE_DAYS[range])
  return d.toLocaleDateString('en-CA')
}

export const buildDailySeries = (
  points: DailyPatrimonyPoint[],
  range: DailyRange,
): DailyChartPoint[] => {
  const indexed = toIndexed(points)
  const last = indexed.at(-1)
  if (!last) return []
  const start = rangeStart(range, last.date)
  const sliced = indexed.filter((p) => p.date >= start)
  const base = sliced[0]?.index ?? 1
  return sliced.map((p) => ({
    date: p.date,
    value: p.value,
    returnPct: (p.index / base - 1) * 100,
    dayChange: p.dayChange,
    dayChangePct: p.dayChangePct,
  }))
}

export const formatDay = (date: string) => {
  const [, m, d] = date.split('-')
  return `${d}/${m}`
}

export const formatDayLong = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
