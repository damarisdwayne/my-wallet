import { useEffect, useState } from 'react'
import { fetchVariationPct, hasHistory } from '@/lib/price-variation'
import type { Asset } from '@/types'

interface PriceVariations {
  variations: Map<string, number>
  loading: boolean
}

interface Result {
  key: string
  variations: Map<string, number>
}

const EMPTY: Result = { key: '', variations: new Map() }

// Variation of each asset over the last `days`, keyed by ticker. Pass days = null to skip fetching.
export const usePriceVariations = (assets: Asset[], days: number | null): PriceVariations => {
  const [result, setResult] = useState<Result>(EMPTY)

  const eligible = assets.filter((a) => hasHistory(a.type))
  const key = `${days}#${eligible.map((a) => `${a.ticker}:${a.currentPrice}`).join('|')}`
  const enabled = days !== null && eligible.length > 0

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void Promise.all(
      eligible.map(async (a) => [a.ticker, await fetchVariationPct(a, days)] as const),
    ).then((entries) => {
      if (cancelled) return
      const found = entries.filter((e): e is readonly [string, number] => e[1] !== null)
      setResult({ key, variations: new Map(found) })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { variations: result.variations, loading: enabled && result.key !== key }
}
