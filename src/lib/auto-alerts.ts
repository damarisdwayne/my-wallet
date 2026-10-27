import type { PriceMap } from '@/services/quotes'
import type { Asset, AutoAlertKind, AutoAlertSettings } from '@/types'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEKLY_COOLDOWN_DAYS = 7

export interface AlertHit {
  kind: AutoAlertKind
  asset: Asset
  pct: number
  price: number
}

interface DetectInput {
  assets: Asset[]
  prices: PriceMap
  weekly: Map<string, number>
  settings: AutoAlertSettings
  today: string
}

export const alertKey = (kind: AutoAlertKind, ticker: string) => `${kind}:${ticker.toUpperCase()}`

export const belowAvgPct = (asset: Asset, price = asset.currentPrice): number | null =>
  asset.quantity > 0 && asset.avgPrice > 0 && price > 0 && price < asset.avgPrice
    ? ((price - asset.avgPrice) / asset.avgPrice) * 100
    : null

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS)

// belowAvg fires once per dip (reset when the price recovers); drops have time cooldowns
const isCoolingDown = (kind: AutoAlertKind, last: string | undefined, today: string) => {
  if (!last) return false
  if (kind === 'dailyDrop') return last === today
  if (kind === 'weeklyDrop') return daysBetween(last, today) < WEEKLY_COOLDOWN_DAYS
  return true
}

const measure = (kind: AutoAlertKind, asset: Asset, input: DetectInput): number | null => {
  const ticker = asset.ticker.toUpperCase()
  const price = input.prices[ticker]
  if (!price) return null
  const { settings } = input
  if (kind === 'dailyDrop') {
    const pct = price.changePct
    return pct !== undefined && pct <= -settings.dailyDrop.pct ? pct : null
  }
  if (kind === 'weeklyDrop') {
    const pct = input.weekly.get(asset.ticker)
    return pct !== undefined && pct <= -settings.weeklyDrop.pct ? pct : null
  }
  return belowAvgPct(asset, price.brl)
}

const KINDS: AutoAlertKind[] = ['dailyDrop', 'weeklyDrop', 'belowAvg']

export const detectAutoAlerts = (input: DetectInput) => {
  const { assets, prices, settings, today } = input
  const fired = { ...settings.fired }
  const hits: AlertHit[] = []

  KINDS.filter((kind) => settings[kind].enabled).forEach((kind) => {
    assets.forEach((asset) => {
      const key = alertKey(kind, asset.ticker)
      const pct = measure(kind, asset, input)
      if (pct === null) {
        if (kind === 'belowAvg' && prices[asset.ticker.toUpperCase()]) delete fired[key]
        return
      }
      if (isCoolingDown(kind, fired[key], today)) return
      fired[key] = today
      hits.push({ kind, asset, pct, price: prices[asset.ticker.toUpperCase()].brl })
    })
  })

  return { hits, fired }
}
