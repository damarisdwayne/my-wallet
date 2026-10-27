import { useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { priceChangesAtom, priceChangesOpenAtom } from '@/store/prices'
import type { Asset } from '@/types'
import { ChangesList } from './changes-list'
import { PERIODS } from './periods'
import type { Period } from './periods'
import { relativeSince } from './relative-time'
import { usePeriodChanges } from './use-period-changes'

export { PriceChangesButton } from './open-button'

interface Props {
  assets: Asset[]
}

export const PriceChangesDialog = ({ assets }: Props) => {
  const [open, setOpen] = useAtom(priceChangesOpenAtom)
  const summary = useAtomValue(priceChangesAtom)
  const [period, setPeriod] = useState<Period>('refresh')
  const { changes, loading } = usePeriodChanges(assets, period, open)

  const description =
    period === 'refresh'
      ? summary
        ? relativeSince(summary.previousRefreshAt, summary.refreshedAt)
        : 'atualize os preços para comparar'
      : `nos últimos ${period} dias`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-primary/70" />
            Maiores variações
          </DialogTitle>
          <DialogDescription className="text-xs">
            {description} · ordenado por impacto na carteira
          </DialogDescription>
        </DialogHeader>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="w-full">
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="flex-1">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ChangesList changes={changes} loading={loading} />
      </DialogContent>
    </Dialog>
  )
}
