import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { MarketIndicators } from '@/components/market-indicators'
import { PatrimonyChart } from '@/components/patrimony-chart'
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

const currentMonth = new Date().toISOString().slice(0, 7)

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
            <div className="h-52 rounded bg-muted animate-pulse" />
          ) : (
            <PatrimonyChart
              history={patrimonyHistory}
              currentValue={totalPatrimony}
              currentMonth={currentMonth}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
