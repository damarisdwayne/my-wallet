import { BarChart2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { MarketIndicators } from '@/components/market-indicators'
import { PatrimonyChart } from '@/components/patrimony-chart'
import { useDashboard, CURRENT_MONTH, type AllocationSlice } from '@/hooks/use-dashboard'
import { formatCurrency, formatPercent } from '@/lib/utils'

/* ─── stat card ─── */

const StatCard = ({
  title,
  value,
  sub,
  subPositive,
  note,
  icon,
  loading,
  valueClass,
}: {
  title: string
  value: string
  sub?: string
  subPositive?: boolean
  note?: string
  icon: React.ReactNode
  loading?: boolean
  valueClass?: string
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
        <CardValue className={valueClass}>{value}</CardValue>
      )}
      {sub && !loading && (
        <p
          className={`text-xs font-medium ${
            subPositive === undefined
              ? 'text-muted-foreground'
              : subPositive
                ? 'text-success'
                : 'text-destructive'
          }`}
        >
          {sub}
        </p>
      )}
      {note && !loading && <p className="text-xs text-muted-foreground">{note}</p>}
    </CardHeader>
  </Card>
)

/* ─── allocation bar ─── */

const AllocationBar = ({
  allocation,
  loading,
}: {
  allocation: AllocationSlice[]
  loading: boolean
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full rounded-full bg-muted animate-pulse" />
          <div className="flex gap-4 mt-3 flex-wrap">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="h-3 w-20 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (allocation.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alocação por classe</CardTitle>
          <BarChart2 size={16} className="text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-px">
          {allocation.map((s) => (
            <div
              key={s.type}
              title={`${s.label}: ${s.pct.toFixed(1)}%`}
              style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            />
          ))}
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {allocation.map((s) => (
            <div key={s.type} className="flex items-center gap-2 min-w-[120px]">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-xs font-medium ml-auto">{s.pct.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── page ─── */

export const DashboardPage = () => {
  const {
    loading,
    totalPatrimony,
    totalCost,
    totalReturn,
    totalGain,
    monthlySalary,
    monthlyDividends,
    yearDividends,
    monthlyExpenses,
    patrimonyHistory,
    allocation,
  } = useDashboard()

  const monthLabel = new Date().toLocaleString('pt-BR', { month: 'long' })
  const monthLabelShort = new Date().toLocaleString('pt-BR', { month: 'short' })
  const balance = monthlySalary + monthlyDividends - monthlyExpenses

  return (
    <div className="p-6 space-y-6">
      {/* market indicators */}
      <Card>
        <CardContent className="pt-4">
          <MarketIndicators />
        </CardContent>
      </Card>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          title="Patrimônio Total"
          value={formatCurrency(totalPatrimony)}
          sub={`${formatPercent(totalReturn)} desde o início`}
          subPositive={totalReturn >= 0}
          note={`Investido: ${formatCurrency(totalCost)}`}
          icon={<Wallet size={16} />}
        />
        <StatCard
          loading={loading}
          title="Ganho não realizado"
          value={`${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}`}
          valueClass={totalGain >= 0 ? 'text-success' : 'text-destructive'}
          sub={formatPercent(totalReturn)}
          subPositive={totalReturn >= 0}
          icon={totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        />
        <StatCard
          loading={loading}
          title={`Proventos (${monthLabelShort})`}
          value={formatCurrency(monthlyDividends)}
          sub={monthlyDividends > 0 ? `+${formatCurrency(monthlyDividends)}` : undefined}
          subPositive
          note={`Acumulado no ano: ${formatCurrency(yearDividends)}`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          loading={loading}
          title={`Gastos (${monthLabelShort})`}
          value={formatCurrency(monthlyExpenses)}
          sub={
            balance !== 0
              ? `Saldo: ${balance >= 0 ? '+' : ''}${formatCurrency(balance)}`
              : undefined
          }
          subPositive={balance >= 0}
          note="Inclui fixos e parcelas"
          icon={<TrendingDown size={16} />}
        />
      </div>

      {/* allocation bar */}
      <AllocationBar allocation={allocation} loading={loading} />

      {/* patrimony chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-52 rounded bg-muted animate-pulse" />
          ) : (
            <PatrimonyChart
              history={patrimonyHistory}
              currentValue={totalPatrimony}
              currentMonth={CURRENT_MONTH}
            />
          )}
        </CardContent>
      </Card>

      {/* empty month notice */}
      {!loading && monthlyDividends === 0 && monthlyExpenses === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Nenhum provento ou gasto registrado em {monthLabel} ainda.
        </p>
      )}
    </div>
  )
}
