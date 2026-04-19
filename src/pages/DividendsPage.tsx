import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/Card'
import { mockDividends } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'

const byMonth = mockDividends.reduce(
  (acc, d) => {
    const m = d.paymentDate.slice(0, 7)
    acc[m] = (acc[m] ?? 0) + d.amount
    return acc
  },
  {} as Record<string, number>,
)

const totalYTD = mockDividends.reduce((s, d) => s + d.amount, 0)
const totalApr = mockDividends
  .filter((d) => d.paymentDate.startsWith('2026-04'))
  .reduce((s, d) => s + d.amount, 0)

export const DividendsPage = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total YTD 2026</CardTitle>
          <CardValue>{formatCurrency(totalYTD)}</CardValue>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Abril 2026</CardTitle>
          <CardValue>{formatCurrency(totalApr)}</CardValue>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Média Mensal</CardTitle>
          <CardValue>{formatCurrency(totalYTD / Object.keys(byMonth).length)}</CardValue>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-sm font-semibold">Por mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3 h-32">
          {Object.entries(byMonth).map(([m, v]) => {
            const max = Math.max(...Object.values(byMonth))
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-success/70 hover:bg-success transition-colors"
                  style={{ height: `${(v / max) * 100}%` }}
                  title={formatCurrency(v)}
                />
                <span className="text-[10px] text-muted-foreground">{m.slice(5)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-sm font-semibold">
          Histórico de proventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...mockDividends]
            .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
            .map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-foreground w-20">{d.ticker}</span>
                  <Badge
                    variant={
                      d.type === 'rendimento' ? 'default' : d.type === 'jcp' ? 'warning' : 'success'
                    }
                  >
                    {d.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{formatDate(d.paymentDate)}</span>
                  {d.ir ? (
                    <span className="text-xs text-muted-foreground">
                      IR: {formatCurrency(d.ir)}
                    </span>
                  ) : null}
                  <span className="text-sm font-semibold text-success">
                    + {formatCurrency(d.amount)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  </div>
)
