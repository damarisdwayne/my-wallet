import { FileText } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { formatCurrency, formatDate } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { UpcomingDividend } from '@/services/statusinvest'
import type { ReportEvent } from '../utils/report-events'

const typeBadge = (type: string) => {
  if (type === 'JCP') return <Badge variant="secondary">JCP</Badge>
  if (type === 'Rendimento') return <Badge variant="outline">Rendimento</Badge>
  return <Badge variant="outline">Dividendo</Badge>
}

const reportLabel = (r: ReportEvent) => {
  if (r.reportType === 'InformensMensal') return 'Informe Mensal'
  if (r.reportType === 'DFP') return 'DFP (Anual)'
  return `ITR (${r.period})`
}

/* ─── Dividend events ─────────────────────────────────────────────── */

type DayEventsProps = {
  date: string
  dividends: UpcomingDividend[]
  reports: ReportEvent[]
}

export const DayEvents = ({ date, dividends, reports }: DayEventsProps) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const total = dividends.reduce((s, e) => s + e.totalValue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatDate(date)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dividends */}
        {dividends.length > 0 && (
          <div className="space-y-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Proventos
            </p>
            {dividends.map((e) => (
              <div
                key={`${e.ticker}-${e.paymentDate}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-foreground shrink-0">{e.ticker}</span>
                  {typeBadge(e.type)}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {fmt(e.totalValue)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {fmt(e.valuePerShare)}/cota
                  </p>
                </div>
              </div>
            ))}
            {dividends.length > 1 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{fmt(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {reports.length > 0 && (
          <div className="space-y-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Relatórios (prazo CVM)
            </p>
            {reports.map((r) => (
              <div
                key={`${r.ticker}-${r.reportType}-${r.period}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={12} className="text-amber-500 shrink-0" />
                  <span className="font-semibold text-sm text-foreground shrink-0">{r.ticker}</span>
                  <span className="text-xs text-muted-foreground truncate">{reportLabel(r)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{r.period}</span>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground/70 pt-1">
              Datas estimadas com base nos prazos CVM — podem variar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Provisioned dividends ───────────────────────────────────────── */

type ProvisionedListProps = {
  dividends: UpcomingDividend[]
}

export const ProvisionedList = ({ dividends }: ProvisionedListProps) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  if (dividends.length === 0) return null

  const total = dividends.reduce((s, e) => s + e.totalValue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>A definir</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Proventos com data-com passada, sem data de pagamento confirmada.
        </p>
        <div className="space-y-0">
          {dividends.map((e, i) => (
            <div
              key={`${e.ticker}-${i}`}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm text-foreground shrink-0">{e.ticker}</span>
                {typeBadge(e.type)}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {fmt(e.totalValue)}
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {fmt(e.valuePerShare)}/cota
                </p>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground font-medium">Total estimado</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{fmt(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
