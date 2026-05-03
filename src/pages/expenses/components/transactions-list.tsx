import { Trash2 } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { DisplayExpense } from '@/types'
import { SOURCE_LABEL } from '../constants'
import { categoryColors, categoryLabel, formatMonthLabel } from '../utils'

type Props = {
  entries: DisplayExpense[]
  selectedMonth: string
  onDelete: (id: string) => void
}

export const TransactionsList = ({ entries, selectedMonth, onDelete }: Props) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Transações — {formatMonthLabel(selectedMonth)}</CardTitle>
        <span className="text-xs text-muted-foreground">{entries.length} registros</span>
      </div>
    </CardHeader>
    <CardContent>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum gasto registrado neste mês.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="group flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge variant={categoryColors[e.category]}>{categoryLabel[e.category]}</Badge>
                <span className="text-sm text-foreground">
                  {e.description}
                  {e.source === 'installment' && e.installmentNumber != null && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({e.installmentNumber}/{e.totalInstallments})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground border border-border rounded px-1">
                  {SOURCE_LABEL[e.source]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{formatDate(e.date)}</span>
                <span className="text-sm font-semibold text-destructive">
                  - {formatCurrency(e.amount)}
                </span>
                {(e.source === 'manual' || e.source === 'bank') && (
                  <button
                    onClick={() => onDelete(e.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
