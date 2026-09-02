import { formatCurrency, formatPercent } from '@/lib/utils'
import { MASK_SHORT } from '@/store/privacy'
import type { PriceChange } from '@/store/prices'

interface Props {
  change: PriceChange
  hideValues: boolean
}

export const ChangeRow = ({ change, hideValues }: Props) => {
  const up = change.pct >= 0
  const tone = up ? 'text-emerald-500' : 'text-rose-500'

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{change.ticker}</p>
        <p className="text-[11px] text-muted-foreground/70">
          {formatCurrency(change.oldPrice)} → {formatCurrency(change.newPrice)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold tabular-nums ${tone}`}>{formatPercent(change.pct)}</p>
        <p className={`text-[11px] tabular-nums ${tone}`}>
          {hideValues
            ? MASK_SHORT
            : `${up ? '+' : '−'}${formatCurrency(Math.abs(change.impactBrl))}`}
        </p>
      </div>
    </div>
  )
}
