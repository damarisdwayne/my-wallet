import { fetchHistoricalPrices } from '@/services/quotes'
import type { HistoricalPoint } from '@/services/quotes'
import type { PriceChange } from '@/store/prices'
import type { Asset, AssetType } from '@/types'

const DAY_MS = 24 * 60 * 60 * 1000
const FOREIGN_TYPES = new Set<AssetType>(['stock_us', 'etf_us'])

// Only exchange-traded assets have daily history on brapi
export const HISTORY_TYPES = new Set<AssetType>([
  'stock',
  'fii',
  'bdr',
  'etf',
  'stock_us',
  'etf_us',
])

export const hasHistory = (type: AssetType) => HISTORY_TYPES.has(type)

// Last close on or before `days` ago; falls back to the oldest point when the
// window is longer than the fetched history (1 month range).
const referenceClose = (points: HistoricalPoint[], days: number): number | null => {
  if (points.length === 0) return null
  const cutoff = new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10)
  const ref = points.filter((p) => p.date <= cutoff).at(-1) ?? points[0]
  return ref.close > 0 ? ref.close : null
}

// US history comes in USD, so compare against the native USD price to keep FX out of it
const nativePrice = (asset: Asset): number =>
  FOREIGN_TYPES.has(asset.type) ? (asset.currentPriceUsd ?? 0) : asset.currentPrice

export const fetchVariationPct = async (asset: Asset, days: number): Promise<number | null> => {
  if (!hasHistory(asset.type)) return null
  const current = nativePrice(asset)
  if (current <= 0) return null
  const ref = referenceClose(await fetchHistoricalPrices(asset.ticker.toUpperCase()), days)
  return ref ? ((current - ref) / ref) * 100 : null
}

export const toPriceChange = (asset: Asset, pct: number): PriceChange => {
  const oldPrice = asset.currentPrice / (1 + pct / 100)
  return {
    ticker: asset.ticker,
    type: asset.type,
    quantity: asset.quantity,
    oldPrice,
    newPrice: asset.currentPrice,
    pct,
    impactBrl: (asset.currentPrice - oldPrice) * asset.quantity,
  }
}
