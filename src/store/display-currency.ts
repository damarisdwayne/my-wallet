import { atom, useAtom } from 'jotai'
import { formatCurrency } from '@/lib/utils'
import { useMarketData } from '@/hooks/use-market-data'

export const displayUsdAtom = atom(false)

export const useDisplayCurrency = () => {
  const [displayUsd, setDisplayUsd] = useAtom(displayUsdAtom)
  const { data } = useMarketData()
  const usdRate = data?.usdBrl ?? 0
  const canShowUsd = usdRate > 0

  const formatUsd = (usd: number) =>
    `$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const fmt = (brl: number): string => {
    if (displayUsd && canShowUsd) return formatUsd(brl / usdRate)
    return formatCurrency(brl)
  }

  /**
   * Quando o ativo tem o valor original em USD armazenado, usa-o diretamente
   * em vez de conversão reversa (BRL ÷ cotação atual).
   * Usar pra PM, Total investido, Preço atual e Total atual de cripto/exterior.
   */
  const fmtPreferUsd = (brl: number, usdOriginal: number | undefined): string => {
    if (displayUsd && usdOriginal != null && usdOriginal > 0) return formatUsd(usdOriginal)
    return fmt(brl)
  }

  return {
    displayUsd,
    setDisplayUsd,
    toggleDisplayUsd: () => setDisplayUsd((v) => !v),
    usdRate,
    canShowUsd,
    fmt,
    fmtPreferUsd,
  }
}
