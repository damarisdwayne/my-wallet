import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { usePriceVariations } from '@/hooks/use-price-variations'
import { toPriceChange } from '@/lib/price-variation'
import { priceChangesAtom } from '@/store/prices'
import type { PriceChange } from '@/store/prices'
import type { Asset } from '@/types'
import { periodDays } from './periods'
import type { Period } from './periods'

interface PeriodChanges {
  changes: PriceChange[]
  loading: boolean
}

export const usePeriodChanges = (assets: Asset[], period: Period, open: boolean): PeriodChanges => {
  const summary = useAtomValue(priceChangesAtom)
  const days = open ? periodDays(period) : null
  const { variations, loading } = usePriceVariations(assets, days)

  const historical = useMemo(
    () =>
      assets
        .flatMap((a) => {
          const pct = variations.get(a.ticker)
          return pct === undefined ? [] : [toPriceChange(a, pct)]
        })
        .sort((a, b) => Math.abs(b.impactBrl) - Math.abs(a.impactBrl)),
    [assets, variations],
  )

  if (period === 'refresh') return { changes: summary?.changes ?? [], loading: false }
  return { changes: historical, loading }
}
