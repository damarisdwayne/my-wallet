import { formatCurrency, formatPercent } from '@/lib/utils'
import type { AutoAlertKind } from '@/types'
import type { AlertHit } from './auto-alerts'

const MAX_LINES = 5

export const AUTO_ALERT_TITLES: Record<AutoAlertKind, string> = {
  dailyDrop: 'Queda forte hoje',
  weeklyDrop: 'Queda forte na semana',
  belowAvg: 'Abaixo do preço médio',
}

export const hitLine = ({ kind, asset, pct, price }: AlertHit) =>
  kind === 'belowAvg'
    ? `${asset.ticker} ${formatCurrency(price)} (PM ${formatCurrency(asset.avgPrice)}, ${formatPercent(pct, 1)})`
    : `${asset.ticker} ${formatPercent(pct, 1)}`

// One digest per kind: a market-wide drop would otherwise fire one alert per asset
export const summarize = (hits: AlertHit[]) => {
  const sorted = [...hits].sort((a, b) => a.pct - b.pct)
  const lines = sorted.map(hitLine)
  const shown = lines.slice(0, MAX_LINES).join(' · ')
  const rest = lines.length - MAX_LINES
  return { lines, message: rest > 0 ? `${shown} e mais ${rest}` : shown }
}
