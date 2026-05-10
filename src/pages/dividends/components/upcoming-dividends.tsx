import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components'
import { formatCurrency, formatDate } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { UpcomingDividend } from '@/services/statusinvest'

const PAID_COLOR = 'hsl(142 71% 45%)'
const PROV_COLOR = 'hsl(142 50% 22%)'

/* ─── Compact donut (used inside summary card) ───────────────────── */

const R = 28
const CX = 36
const CY = 36
const SW = 9
const CIRC = 2 * Math.PI * R

export const MonthDonutCard = ({
  paid,
  provisioned,
  prevMonth,
}: {
  paid: number
  provisioned: number
  prevMonth: number
}) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const total = paid + provisioned
  const paidArc = total > 0 ? (paid / total) * CIRC : 0
  const provArc = CIRC - paidArc

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mês atual</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {/* mini donut */}
        <div className="relative shrink-0">
          <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth={SW} />
            {provisioned > 0 && (
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={PROV_COLOR}
                strokeWidth={SW}
                strokeDasharray={`${provArc} ${CIRC - provArc}`}
                strokeDashoffset={-paidArc}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            )}
            {paid > 0 && (
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={PAID_COLOR}
                strokeWidth={SW}
                strokeDasharray={`${paidArc} ${CIRC - paidArc}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  paid > 0 ? PAID_COLOR : provisioned > 0 ? PROV_COLOR : 'hsl(var(--muted))',
              }}
            />
          </div>
        </div>

        {/* stats */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PAID_COLOR }} />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                Pago
              </p>
              <p className="text-sm font-semibold text-foreground">{fmt(paid)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PROV_COLOR }} />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                Provisionado
              </p>
              <p className="text-sm font-semibold text-foreground">{fmt(provisioned)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0 bg-muted" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                Mês anterior
              </p>
              <p className="text-sm font-semibold text-muted-foreground">{fmt(prevMonth)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Type badge ─────────────────────────────────────────────────── */

const typeBadge = (type: string) => {
  if (type === 'JCP') return <Badge variant="secondary">JCP</Badge>
  if (type === 'Rendimento') return <Badge variant="outline">Rendimento</Badge>
  return <Badge variant="outline">Dividendo</Badge>
}

/* ─── Upcoming table ─────────────────────────────────────────────── */

type Props = {
  upcoming: UpcomingDividend[]
  loading: boolean
}

export const UpcomingDividendsTable = ({ upcoming, loading }: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Proventos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14 ml-auto" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum provento encontrado para os próximos meses.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-muted-foreground uppercase tracking-wide border-b border-border">
                  <th className="text-left pb-2 pr-4 font-medium">Ticker</th>
                  <th className="text-left pb-2 pr-4 font-medium">Tipo</th>
                  <th className="text-left pb-2 pr-4 font-medium hidden sm:table-cell">Data-Com</th>
                  <th className="text-left pb-2 pr-4 font-medium">Pagamento</th>
                  <th className="text-right pb-2 pr-4 font-medium">Por cota</th>
                  <th className="text-right pb-2 font-medium">Total est.</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((d, i) => (
                  <tr
                    key={`${d.ticker}-${d.dateCom}-${i}`}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-semibold text-foreground">{d.ticker}</td>
                    <td className="py-2.5 pr-4">{typeBadge(d.type)}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground hidden sm:table-cell">
                      {d.dateCom ? formatDate(d.dateCom) : '—'}
                    </td>
                    <td className="py-2.5 pr-4">
                      {d.isProvisioned || !d.paymentDate ? (
                        <span className="text-xs text-muted-foreground italic">A definir</span>
                      ) : (
                        formatDate(d.paymentDate)
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground tabular-nums">
                      {fmt(d.valuePerShare)}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-foreground tabular-nums">
                      {fmt(d.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={5} className="pt-3 text-xs text-muted-foreground font-medium">
                    Total estimado
                  </td>
                  <td className="pt-3 text-right font-bold text-foreground tabular-nums">
                    {fmt(upcoming.reduce((s, d) => s + d.totalValue, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
