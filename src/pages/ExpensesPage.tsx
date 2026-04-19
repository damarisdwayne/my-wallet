import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockExpenses } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense, ExpenseCategory } from '@/types'

const categoryLabel: Record<ExpenseCategory, string> = {
  housing: 'Moradia',
  food: 'Alimentação',
  transport: 'Transporte',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  clothing: 'Vestuário',
  subscriptions: 'Assinaturas',
  investments: 'Investimentos',
  other: 'Outros',
}

const categoryColors: Record<
  ExpenseCategory,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  housing: 'destructive',
  food: 'warning',
  transport: 'default',
  health: 'success',
  education: 'default',
  entertainment: 'secondary',
  clothing: 'secondary',
  subscriptions: 'warning',
  investments: 'success',
  other: 'secondary',
}

const totals = mockExpenses.reduce(
  (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }),
  {} as Record<string, number>,
)
const grand = Object.values(totals).reduce((s, v) => s + v, 0)

export const ExpensesPage = () => {
  const [expenses] = useState<Expense[]>(mockExpenses)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Gastos — Abril 2026</h2>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
          <PlusCircle size={15} />
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(totals).map(([cat, val]) => (
          <Card key={cat} className="text-center">
            <CardHeader className="p-4">
              <CardTitle>{categoryLabel[cat as ExpenseCategory]}</CardTitle>
              <p className="text-lg font-bold text-foreground">{formatCurrency(val)}</p>
              <p className="text-xs text-muted-foreground">{((val / grand) * 100).toFixed(1)}%</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={categoryColors[e.category]}>{categoryLabel[e.category]}</Badge>
                  <span className="text-sm text-foreground">{e.description}</span>
                  {e.source === 'manual' && (
                    <span className="text-[10px] text-muted-foreground border border-border rounded px-1">
                      manual
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{formatDate(e.date)}</span>
                  <span className="text-sm font-semibold text-destructive">
                    - {formatCurrency(e.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
