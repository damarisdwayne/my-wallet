import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { belowAvgPct } from '@/lib/auto-alerts'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { Asset } from '@/types'
import { lastBuyPct } from '../last-buy'
import type { LastBuy } from '../last-buy'

interface Props {
  asset: Asset
  lastBuy?: LastBuy
}

const badgeLabel = (avgPct: number | null, buyPct: number | null) => {
  if (avgPct !== null && buyPct !== null) return 'abaixo do PM e da últ. compra'
  if (avgPct !== null) return `abaixo do PM ${formatPercent(avgPct, 1)}`
  return `abaixo da últ. compra ${formatPercent(buyPct ?? 0, 1)}`
}

export const PriceSignalBadge = ({ asset, lastBuy }: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const avgPct = belowAvgPct(asset)
  const rawBuyPct = lastBuy ? lastBuyPct(asset, lastBuy) : null
  const buyPct = rawBuyPct !== null && rawBuyPct < 0 ? rawBuyPct : null
  if (avgPct === null && buyPct === null) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning tabular-nums">
          {badgeLabel(avgPct, buyPct)}
        </span>
      </TooltipTrigger>
      <TooltipContent className="space-y-0.5 text-xs">
        {avgPct !== null && (
          <p>
            PM {fmt(asset.avgPrice)} ({formatPercent(avgPct, 1)})
          </p>
        )}
        {buyPct !== null && lastBuy && (
          <p>
            Última compra {fmt(lastBuy.price)} ({formatPercent(buyPct, 1)})
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
