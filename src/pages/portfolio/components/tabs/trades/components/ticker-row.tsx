import { ChevronDown } from 'lucide-react'
import { cn, formatQuantity } from '@/lib/utils'
import type { Asset, Trade } from '@/types'
import { getFiLabel } from '@/lib/fi'
import { TradeList } from './trade-list'
import { TradeMoney } from './trade-money'

interface Props {
  ticker: string
  items: Trade[]
  bought: number
  sold: number
  totalInvested: number
  totalInvestedUsd?: number
  totalInvestedUsdApprox?: boolean
  isExpanded: boolean
  onToggle: (ticker: string) => void
  onDeleteTrade: (tradeId: string) => Promise<void>
  onEditTrade: (tradeId: string, patch: Partial<Trade>) => Promise<void>
  asset: Asset | undefined
}

export const TickerRow = ({
  ticker,
  items,
  bought,
  sold,
  totalInvested,
  totalInvestedUsd,
  totalInvestedUsdApprox,
  isExpanded,
  onToggle,
  onDeleteTrade,
  onEditTrade,
  asset,
}: Props) => {
  const isFixedIncome = asset?.type === 'fixed_income'
  const displayName = isFixedIncome && asset ? getFiLabel(asset) : ticker

  return (
    <>
      <button
        onClick={() => onToggle(ticker)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <ChevronDown
          size={14}
          className={cn(
            'text-muted-foreground shrink-0 transition-transform',
            isExpanded && 'rotate-180',
          )}
        />
        <span
          className={cn(
            'font-semibold text-foreground text-sm shrink-0',
            isFixedIncome ? 'flex-1 truncate' : 'w-20',
          )}
        >
          {displayName}
        </span>
        <span className="text-xs text-muted-foreground">{items.length} op.</span>
        <span className="text-xs text-success ml-2">+{formatQuantity(bought, asset?.type)}</span>
        {sold > 0 && (
          <span className="text-xs text-destructive">-{formatQuantity(sold, asset?.type)}</span>
        )}
        <TradeMoney
          brl={totalInvested}
          usd={totalInvestedUsd}
          usdApprox={totalInvestedUsdApprox}
          usdTitle={
            totalInvestedUsdApprox ? 'Convertido pelo câmbio atual (valor aproximado)' : undefined
          }
          className="text-xs text-muted-foreground ml-auto tabular-nums"
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <TradeList
            items={items}
            getAsset={() => asset}
            onDeleteTrade={onDeleteTrade}
            onEditTrade={onEditTrade}
          />
        </div>
      )}
    </>
  )
}
