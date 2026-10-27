import type { Asset, Trade } from '@/types'
import { isForeignType } from './utils'

export interface LastBuy {
  price: number
  priceUsd?: number
  date: string
}

// Labeled buys (bonificação, desdobramento...) are corporate events, not real purchases
export const lastBuysByTicker = (trades: Trade[]): Map<string, LastBuy> => {
  const map = new Map<string, LastBuy>()
  trades
    .filter((t) => t.type === 'buy' && !t.label && t.price > 0)
    .forEach((t) => {
      const key = t.ticker.toUpperCase()
      const current = map.get(key)
      if (!current || t.date > current.date)
        map.set(key, { price: t.price, priceUsd: t.priceUsd, date: t.date })
    })
  return map
}

// Compared in USD for foreign assets when both sides have it, so FX doesn't skew the result
export const lastBuyPct = (asset: Asset, lastBuy: LastBuy): number | null => {
  const useUsd = isForeignType(asset.type) && lastBuy.priceUsd && asset.currentPriceUsd
  const now = useUsd ? (asset.currentPriceUsd ?? 0) : asset.currentPrice
  const then = useUsd ? (lastBuy.priceUsd ?? 0) : lastBuy.price
  return now > 0 && then > 0 ? ((now - then) / then) * 100 : null
}
