import { formatCurrency } from '@/lib/utils'
import { darfDeadline, monthLabel } from '../../../utils'

type Props = {
  totalGain: number
  totalDarf: number
  pendingDarf: number
  isCurrentYear: boolean
  currentData: { irDue: number; sales: number } | undefined
  currentMonth: string
  activeMonthsCount: number
}

export const SummaryCards = ({
  totalGain,
  totalDarf,
  pendingDarf,
  isCurrentYear,
  currentData,
  currentMonth,
  activeMonthsCount,
}: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Ganho líquido</p>
      <p
        className={`text-xl font-bold mt-1 ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}
      >
        {formatCurrency(totalGain)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {activeMonthsCount} mês(es) com operações
      </p>
    </div>
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Total DARF no ano</p>
      <p
        className={`text-xl font-bold mt-1 ${totalDarf > 0 ? 'text-destructive' : 'text-foreground'}`}
      >
        {formatCurrency(totalDarf)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">Cód. 6015</p>
    </div>
    {isCurrentYear && (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">DARF pendente</p>
        <p
          className={`text-xl font-bold mt-1 ${pendingDarf > 0 ? 'text-destructive' : 'text-foreground'}`}
        >
          {formatCurrency(pendingDarf)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {pendingDarf > 0 ? 'Verifique os meses abaixo' : 'Nada em aberto'}
        </p>
      </div>
    )}
    {isCurrentYear && currentData && currentData.sales > 0 && (
      <div
        className={`rounded-lg border p-4 ${
          currentData.irDue > 0 ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border bg-card'
        }`}
      >
        <p className="text-xs text-muted-foreground">Mês atual — {monthLabel(currentMonth)}</p>
        <p
          className={`text-xl font-bold mt-1 ${
            currentData.irDue > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-success'
          }`}
        >
          {currentData.irDue > 0 ? formatCurrency(currentData.irDue) : 'Isento'}
        </p>
        {currentData.irDue > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">Vence {darfDeadline(currentMonth)}</p>
        )}
      </div>
    )}
  </div>
)
