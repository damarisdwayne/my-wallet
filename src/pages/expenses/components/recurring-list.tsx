import { Trash2 } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { formatCurrency } from '@/lib/utils'
import type { FixedExpense, InstallmentExpense } from '@/types'
import { categoryColors, categoryLabel, formatMonthLabel } from '../utils'

type Props = {
  fixedExpenses: FixedExpense[]
  installmentExpenses: InstallmentExpense[]
  onDeleteFixed: (id: string) => void
  onDeleteInstallment: (id: string) => void
}

export const RecurringList = ({
  fixedExpenses,
  installmentExpenses,
  onDeleteFixed,
  onDeleteInstallment,
}: Props) => {
  if (fixedExpenses.length === 0 && installmentExpenses.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos Recorrentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {fixedExpenses.map((fe) => (
            <div
              key={fe.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge variant={categoryColors[fe.category]}>{categoryLabel[fe.category]}</Badge>
                <span className="text-sm text-foreground">{fe.description}</span>
                <span className="text-[10px] text-muted-foreground border border-border rounded px-1">
                  fixo · desde {formatMonthLabel(fe.startMonth)}
                  {fe.endMonth ? ` até ${formatMonthLabel(fe.endMonth)}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-destructive">
                  - {formatCurrency(fe.amount)}/mês
                </span>
                <button
                  onClick={() => onDeleteFixed(fe.id)}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {installmentExpenses.map((ie) => (
            <div
              key={ie.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge variant={categoryColors[ie.category]}>{categoryLabel[ie.category]}</Badge>
                <span className="text-sm text-foreground">{ie.description}</span>
                <span className="text-[10px] text-muted-foreground border border-border rounded px-1">
                  {ie.installments}x · desde {formatMonthLabel(ie.startMonth)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-destructive">
                  - {formatCurrency(ie.installmentAmount)}/mês
                </span>
                <button
                  onClick={() => onDeleteInstallment(ie.id)}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
