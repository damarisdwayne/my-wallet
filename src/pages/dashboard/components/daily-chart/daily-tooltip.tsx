import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { MASK } from '@/store/privacy'
import { formatDayLong, type DailyChartPoint } from './utils'

interface Props {
  active?: boolean
  payload?: { payload: DailyChartPoint }[]
  hidden?: boolean
}

const signClass = (v: number) => (v >= 0 ? 'text-success' : 'text-destructive')

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    {children}
  </div>
)

export const DailyTooltip = ({ active, payload, hidden }: Props) => {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div className="space-y-1 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold capitalize text-foreground">{formatDayLong(point.date)}</p>
      <Row label="Rentabilidade">
        <span className={cn('font-medium tabular-nums', signClass(point.returnPct))}>
          {formatPercent(point.returnPct)}
        </span>
      </Row>
      <Row label="Variação do dia">
        <span className={cn('font-medium tabular-nums', signClass(point.dayChange))}>
          {hidden ? MASK : formatCurrency(point.dayChange)} ({formatPercent(point.dayChangePct)})
        </span>
      </Row>
      <Row label="Patrimônio">
        <span className="font-medium tabular-nums text-foreground">
          {hidden ? MASK : formatCurrency(point.value)}
        </span>
      </Row>
    </div>
  )
}
