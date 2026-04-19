import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/Card'
import { mockAssets, mockDividends, mockExpenses, mockPatrimonyHistory } from '@/data/mock'
import { formatCurrency, formatPercent } from '@/lib/utils'

const totalPatrimony = mockAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
const totalCost = mockAssets.reduce((s, a) => s + a.avgPrice * a.quantity, 0)
const totalReturn = ((totalPatrimony - totalCost) / totalCost) * 100

const monthlyDividends = mockDividends
  .filter((d) => d.paymentDate.startsWith('2026-04'))
  .reduce((s, d) => s + d.amount, 0)

const monthlyExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0)

const StatCard = ({
  title,
  value,
  sub,
  positive,
  icon,
}: {
  title: string
  value: string
  sub?: string
  positive?: boolean
  icon: React.ReactNode
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <CardValue>{value}</CardValue>
      {sub && (
        <p className={`text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
          {sub}
        </p>
      )}
    </CardHeader>
  </Card>
)

export const DashboardPage = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Patrimônio Total"
        value={formatCurrency(totalPatrimony)}
        sub={`${formatPercent(totalReturn)} desde o início`}
        positive={totalReturn >= 0}
        icon={<Wallet size={16} />}
      />
      <StatCard
        title="Resultado"
        value={formatCurrency(totalPatrimony - totalCost)}
        sub={formatPercent(totalReturn)}
        positive={totalReturn >= 0}
        icon={totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      />
      <StatCard
        title="Proventos (Abr)"
        value={formatCurrency(monthlyDividends)}
        positive
        icon={<TrendingUp size={16} />}
      />
      <StatCard
        title="Gastos (Abr)"
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
        <div className="flex items-end gap-1 h-40">
          {mockPatrimonyHistory.map((p) => {
            const max = Math.max(...mockPatrimonyHistory.map((x) => x.value))
            const pct = (p.value / max) * 100
            return (
              <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${pct}%` }}
                  title={formatCurrency(p.value)}
                />
                <span className="text-[10px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                  {p.month}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  </div>
)
