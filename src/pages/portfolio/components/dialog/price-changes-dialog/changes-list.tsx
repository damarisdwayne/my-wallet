import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { PriceChange } from '@/store/prices'
import { ChangeRow } from './change-row'

interface Props {
  changes: PriceChange[]
  loading: boolean
}

export const ChangesList = ({ changes, loading }: Props) => {
  const { hideValues } = usePrivacy()

  if (loading && changes.length === 0)
    return <p className="py-8 text-center text-xs text-muted-foreground">Buscando histórico...</p>

  if (changes.length === 0)
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        Nenhuma variação relevante neste período
      </p>
    )

  const netImpact = changes.reduce((acc, c) => acc + c.impactBrl, 0)
  const netTone = netImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'

  return (
    <>
      <div className="mb-2 rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Impacto líquido</p>
        <p className={`text-sm font-semibold tabular-nums ${netTone}`}>
          {hideValues
            ? MASK
            : `${netImpact >= 0 ? '+' : '−'}${formatCurrency(Math.abs(netImpact))}`}
        </p>
      </div>

      <ScrollArea className="max-h-[50vh] -mx-1 px-1">
        <div className="divide-y divide-border">
          {changes.map((change) => (
            <ChangeRow key={change.ticker} change={change} hideValues={hideValues} />
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
