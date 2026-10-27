import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { usePriceVariations } from '@/hooks/use-price-variations'
import { formatPercent } from '@/lib/utils'
import type { Asset } from '@/types'

const DAYS = 7

export const WeeklyVariation = ({ asset }: { asset: Asset }) => {
  const { variations } = usePriceVariations([asset], DAYS)
  const pct = variations.get(asset.ticker)
  if (pct === undefined) return null

  const tone = pct >= 0 ? 'text-emerald-500' : 'text-rose-500'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`text-[11px] font-medium tabular-nums ${tone}`}>
          7d {formatPercent(pct, 1)}
        </span>
      </TooltipTrigger>
      <TooltipContent>Variação do preço nos últimos {DAYS} dias</TooltipContent>
    </Tooltip>
  )
}
