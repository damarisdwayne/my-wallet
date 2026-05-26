import { useAtom } from 'jotai'
import { atom } from 'jotai'
import { formatCurrency } from '@/lib/utils'
import { useMarketData } from '@/hooks/use-market-data'

export const displayUsdAtom = atom(false)

export const useDisplayCurrency = () => {
  const [displayUsd, setDisplayUsd] = useAtom(displayUsdAtom)
  const { data } = useMarketData()
  const usdRate = data?.usdBrl ?? 0
  const canShowUsd = usdRate > 0

  const fmt = (brl: number): string => {
    if (displayUsd && canShowUsd) {
      const usd = brl / usdRate
      return `$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return formatCurrency(brl)
  }

  return {
    displayUsd,
    setDisplayUsd,
    toggleDisplayUsd: () => setDisplayUsd((v) => !v),
    usdRate,
    canShowUsd,
    fmt,
  }
}
