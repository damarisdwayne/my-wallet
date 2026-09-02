import { atom } from 'jotai'
import type { PriceMap } from '@/services/quotes'

// Set by useAssets.refreshPrices after every successful price fetch
// usePriceAlerts watches this to run alert checks
export const freshPricesAtom = atom<PriceMap | null>(null)

export interface PriceChange {
  ticker: string
  type: string
  quantity: number
  oldPrice: number
  newPrice: number
  pct: number
  impactBrl: number
}

export interface PriceChangesSummary {
  changes: PriceChange[]
  previousRefreshAt: number | null
  refreshedAt: number
}

// Movements detected on the last refresh, relative to the previously stored prices
export const priceChangesAtom = atom<PriceChangesSummary | null>(null)
export const priceChangesOpenAtom = atom(false)
