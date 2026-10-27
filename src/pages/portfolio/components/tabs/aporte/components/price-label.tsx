import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { formatCurrency, formatPercent, formatUsdCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { Asset } from '@/types'
import { lastBuyPct } from '../last-buy'
import type { LastBuy } from '../last-buy'
import { isForeignType } from '../utils'

interface Props {
  asset: Asset
  lastBuy?: LastBuy
}

const formatDate = (iso: string) => iso.split('-').reverse().join('/')

// Native currency: US$ for foreign assets, R$ for the rest
const nativePrice = (brl: number, usd: number | undefined, foreign: boolean) =>
  foreign && usd ? formatUsdCurrency(usd) : formatCurrency(brl)

export const PriceLabel = ({ asset, lastBuy }: Props) => {
  const { hideValues } = usePrivacy()
  const foreign = isForeignType(asset.type)
  const label = (
    <span className="text-xs font-normal text-muted-foreground">
      {hideValues ? MASK : nativePrice(asset.currentPrice, asset.currentPriceUsd, foreign)}
    </span>
  )
  if (!lastBuy) return label

  const pct = lastBuyPct(asset, lastBuy)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2">
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        Última compra: {hideValues ? MASK : nativePrice(lastBuy.price, lastBuy.priceUsd, foreign)}{' '}
        em {formatDate(lastBuy.date)}
        {pct !== null && <> ({formatPercent(pct, 1)} vs agora)</>}
      </TooltipContent>
    </Tooltip>
  )
}
