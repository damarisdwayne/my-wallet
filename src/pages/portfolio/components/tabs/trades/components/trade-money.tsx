import { cn, formatCurrency } from '@/lib/utils'

interface Props {
  brl: number
  usd?: number
  /** Converted from BRL at today's rate instead of the original USD value — prefixed with ≈. */
  usdApprox?: boolean
  usdTitle?: string
  className?: string
}

export const TradeMoney = ({ brl, usd, usdApprox, usdTitle, className }: Props) => {
  if (brl <= 0 && !usd) return <span className={className}>—</span>

  return (
    <span className={cn('inline-flex flex-col items-end leading-tight', className)}>
      {brl > 0 && <span>{formatCurrency(brl)}</span>}
      {usd != null && usd > 0 && (
        <span className="text-[10px] text-muted-foreground/70 tabular-nums" title={usdTitle}>
          {usdApprox && '≈ '}
          {formatCurrency(usd, 'USD')}
        </span>
      )}
    </span>
  )
}
