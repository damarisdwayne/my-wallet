import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MarketIndicators } from '@/components/market-indicators'
import { useDashboard } from '@/hooks/use-dashboard'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { usePrivacy } from '@/store/privacy'
import { AllocationBar, PatrimonyChartComponent, StatCard } from './components'

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
    last12Dividends,
    monthlyExpenses,
    patrimonyHistory,
    allocation,
  } = useDashboard()

  const { hideValues } = usePrivacy()

  const monthLabel = new Date().toLocaleString('pt-BR', { month: 'long' })
  const monthLabelShort = new Date().toLocaleString('pt-BR', { month: 'short' })
  const balance = monthlySalary + monthlyDividends - monthlyExpenses

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
          hidden={hideValues}
          title="Patrimônio Total"
          value={formatCurrency(totalPatrimony)}
          sub={`${formatPercent(totalReturn)} desde o início`}
          subPositive={totalReturn >= 0}
          note={`Investido: ${formatCurrency(totalCost)}`}
          icon={<Wallet size={16} />}
        />
        <StatCard
          loading={loading}
          hidden={hideValues}
          title="Ganho não realizado"
          value={`${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}`}
          valueClass={totalGain >= 0 ? 'text-success' : 'text-destructive'}
          sub={formatPercent(totalReturn)}
          subPositive={totalReturn >= 0}
          icon={totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        />
        <StatCard
          loading={loading}
          hidden={hideValues}
          title="Proventos (12M)"
          value={formatCurrency(last12Dividends)}
          sub={
            monthlyDividends > 0
              ? `${monthLabelShort}: +${formatCurrency(monthlyDividends)}`
              : undefined
          }
          subPositive
          note={`No ano: ${formatCurrency(yearDividends)}`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          loading={loading}
          hidden={hideValues}
          title={`Gastos (${monthLabelShort})`}
          value={formatCurrency(monthlyExpenses)}
          sub={
            balance === 0
              ? undefined
              : `Saldo: ${balance >= 0 ? '+' : ''}${formatCurrency(balance)}`
          }
          subPositive={balance >= 0}
          note="Inclui fixos e parcelas"
          icon={<TrendingDown size={16} />}
        />
      </div>

      <AllocationBar allocation={allocation} loading={loading} />

      <PatrimonyChartComponent
        patrimonyHistory={patrimonyHistory}
        totalPatrimony={totalPatrimony}
        loading={loading}
        hidden={hideValues}
      />

      {!loading && monthlyDividends === 0 && monthlyExpenses === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Nenhum provento ou gasto registrado em {monthLabel} ainda.
        </p>
      )}
    </div>
  )
}
