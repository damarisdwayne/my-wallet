import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dividend } from '@/types'
import { TradeMoney } from '../trade-money'
import { DividendList } from './dividend-list'

interface Props {
  ticker: string
  items: Dividend[]
  total: number
  totalUsd?: number
  usdRate: number
  isExpanded: boolean
  onToggle: (ticker: string) => void
  onDelete: (id: string) => void
}

export const DividendTickerRow = ({
  ticker,
  items,
  total,
  totalUsd,
  usdRate,
  isExpanded,
  onToggle,
  onDelete,
}: Props) => (
  <>
    <button
      type="button"
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
      <span className="font-semibold text-foreground text-sm shrink-0 w-20">{ticker}</span>
      <span className="text-xs text-muted-foreground">{items.length} provento(s)</span>
      <TradeMoney
        brl={total}
        usd={totalUsd}
        className="text-xs text-success ml-auto tabular-nums"
      />
    </button>

    {isExpanded && (
      <div className="border-t border-border">
        <DividendList items={items} usdRate={usdRate} onDelete={onDelete} />
      </div>
    )}
  </>
)
