import { useAtom, useAtomValue } from 'jotai'
import { TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import { priceChangesAtom, priceChangesOpenAtom } from '@/store/prices'
import { ChangeRow } from './change-row'
import { relativeSince } from './relative-time'

const MAX_ROWS = 8

export const PriceChangesDialog = () => {
  const [open, setOpen] = useAtom(priceChangesOpenAtom)
  const summary = useAtomValue(priceChangesAtom)
  const { hideValues } = usePrivacy()

  if (!summary || summary.changes.length === 0) return null

  const { changes, previousRefreshAt, refreshedAt } = summary
  const shown = changes.slice(0, MAX_ROWS)
  const netImpact = changes.reduce((acc, c) => acc + c.impactBrl, 0)
  const netTone = netImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-primary/70" />
            Maiores variações
          </DialogTitle>
          <DialogDescription className="text-xs">
            {relativeSince(previousRefreshAt, refreshedAt)} · ordenado por impacto na carteira
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Impacto líquido
          </p>
          <p className={`text-sm font-semibold tabular-nums ${netTone}`}>
            {hideValues
              ? MASK
              : `${netImpact >= 0 ? '+' : '−'}${formatCurrency(Math.abs(netImpact))}`}
          </p>
        </div>

        <div className="divide-y divide-border">
          {shown.map((change) => (
            <ChangeRow key={change.ticker} change={change} hideValues={hideValues} />
          ))}
        </div>

        {changes.length > MAX_ROWS && (
          <p className="pt-3 text-[11px] text-muted-foreground/60 text-center">
            e mais {changes.length - MAX_ROWS}{' '}
            {changes.length - MAX_ROWS === 1 ? 'ativo' : 'ativos'} com variação menor
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
