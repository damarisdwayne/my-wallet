import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { MarketIndicators } from '@/components/market-indicators'
import { useDashboard } from '@/hooks/use-dashboard'
import { formatCurrency, formatPercent } from '@/lib/utils'

const StatCard = ({
  title,
  value,
  sub,
  positive,
  icon,
  loading,
}: {
  title: string
  value: string
  sub?: string
  positive?: boolean
  icon: React.ReactNode
  loading?: boolean
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      {loading ? (
        <div className="h-7 w-32 rounded bg-muted animate-pulse mt-1" />
      ) : (
        <CardValue>{value}</CardValue>
      )}
      {sub && !loading && (
        <p className={`text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
          {sub}
        </p>
      )}
    </CardHeader>
  </Card>
)

export const DashboardPage = () => {
  const {
    loading,
    totalPatrimony,
    totalCost,
    totalReturn,
    monthlyDividends,
    monthlyExpenses,
    patrimonyHistory,
  } = useDashboard()

  const monthLabel = new Date().toLocaleString('pt-BR', { month: 'short' })

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="pt-4">
          <MarketIndicators />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          title="Patrimônio Total"
          value={formatCurrency(totalPatrimony)}
          sub={`${formatPercent(totalReturn)} desde o início`}
          positive={totalReturn >= 0}
          icon={<Wallet size={16} />}
        />
        <StatCard
          loading={loading}
          title="Resultado"
          value={formatCurrency(totalPatrimony - totalCost)}
          sub={formatPercent(totalReturn)}
          positive={totalReturn >= 0}
          icon={totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        />
        <StatCard
          loading={loading}
          title={`Proventos (${monthLabel})`}
          value={formatCurrency(monthlyDividends)}
          positive
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          loading={loading}
          title={`Gastos (${monthLabel})`}
          value={formatCurrency(monthlyExpenses)}
          positive={false}
          icon={<TrendingDown size={16} />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-40 rounded bg-muted animate-pulse" />
          ) : patrimonyHistory.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              Nenhum histórico registrado ainda.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-end gap-1 h-36">
                {patrimonyHistory.map((p) => {
                  const max = Math.max(...patrimonyHistory.map((x) => x.value))
                  const pct = (p.value / max) * 100
                  return (
                    <div key={p.month} className="relative flex-1 h-full flex items-end">
                      <div
                        className="group relative w-full rounded-t bg-primary/70 hover:bg-primary transition-colors cursor-default"
                        style={{ height: `${pct}%` }}
                      >
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded border border-border bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          {formatCurrency(p.value)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-1">
                {patrimonyHistory.map((p) => (
                  <span
                    key={p.month}
                    className="flex-1 text-[9px] text-center text-muted-foreground truncate"
                  >
                    {p.month.slice(5)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
