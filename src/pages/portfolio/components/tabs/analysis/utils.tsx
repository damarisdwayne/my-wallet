export const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export const directPct = (v: number) => v.toFixed(2) + '%'
export const ratio = (v: number) => v.toFixed(2) + 'x'
export const num1 = (v: number) => v.toFixed(1) + 'x'

import type { Rating } from './types'

// Rating builders — return good/ok/bad given the documented "ideal" thresholds.
// higherBetter: value at/above `good` is good, at/above `ok` is medium, below is bad.
export const higherBetter =
  (good: number, ok: number) =>
  (v: number): Rating =>
    v >= good ? 'good' : v >= ok ? 'ok' : 'bad'

// lowerBetter: value at/below `good` is good, at/below `ok` is medium, above is bad.
export const lowerBetter =
  (good: number, ok: number) =>
  (v: number): Rating =>
    v <= good ? 'good' : v <= ok ? 'ok' : 'bad'

// band: good inside [goodLo, goodHi], medium inside [okLo, okHi], otherwise bad.
export const band =
  (goodLo: number, goodHi: number, okLo: number, okHi: number) =>
  (v: number): Rating =>
    v >= goodLo && v <= goodHi ? 'good' : v >= okLo && v <= okHi ? 'ok' : 'bad'

// positiveBetter: positive is good, zero is medium, negative is bad (e.g. free cash flow).
export const positiveBetter = (v: number): Rating => (v > 0 ? 'good' : v < 0 ? 'bad' : 'ok')

export const ratingTextColor: Record<Rating, string> = {
  good: 'text-success',
  ok: 'text-yellow-600',
  bad: 'text-destructive',
}

export const ratingLabel: Record<Rating, string> = {
  good: 'Bom',
  ok: 'Médio',
  bad: 'Ruim',
}

export { formatDateShort as fmtDate } from '@/lib/utils'

import type { FundamentalSnapshot } from '@/types'

// Builds a virtual snapshot using the most recent non-null value per field across all snapshots.
// Prevents sparse newer snapshots from hiding data recorded in earlier months.
export const mergeSnapshots = (snapshots: FundamentalSnapshot[]): FundamentalSnapshot | null => {
  if (snapshots.length === 0) return null
  const result = { ...snapshots[0] }
  for (const snap of snapshots.slice(1)) {
    for (const [k, v] of Object.entries(snap)) {
      if (v != null && v !== '') {
        ;(result as Record<string, unknown>)[k] = v
      }
    }
  }
  return result
}

export const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export const verdictFromText = (text: string): { label: string; className: string } | null => {
  const lower = text.toLowerCase()
  if (lower.includes('otimista'))
    return { label: 'Otimista', className: 'bg-success/10 text-success border-success/20' }
  if (lower.includes('pessimista'))
    return {
      label: 'Pessimista',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    }
  if (lower.includes('neutro'))
    return { label: 'Neutro', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' }
  return null
}
