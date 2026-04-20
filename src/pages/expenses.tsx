import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useExpenses } from '@/hooks/use-expenses'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ExpenseCategory } from '@/types'

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

const emptyForm = {
  description: '',
  amount: '',
  category: 'food' as ExpenseCategory,
  date: new Date().toISOString().slice(0, 10),
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez',
}

const formatMonthLabel = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${MONTH_LABELS[m]}/${y.slice(2)}`
}

const todayMonth = new Date().toISOString().slice(0, 7)

export const ExpensesPage = () => {
  const { expenses, salaryByMonth, addExpense, updateSalary } = useExpenses()
  const [salaryInput, setSalaryInput] = useState('')
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [selectedMonth, setSelectedMonth] = useState<string>(todayMonth)

  const availableMonths = useMemo(() => {
    const months = [...new Set(expenses.map((e) => e.date.slice(0, 7)))]
    return months.sort((a, b) => b.localeCompare(a))
  }, [expenses])

  const salary = salaryByMonth[selectedMonth] ?? salaryByMonth[todayMonth] ?? 0
  const isCurrentMonth = selectedMonth === todayMonth

  const currentIndex = availableMonths.indexOf(selectedMonth)
  const canGoPrev =
    currentIndex === -1 ? availableMonths.length > 0 : currentIndex < availableMonths.length - 1
  const canGoNext = currentIndex > 0

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(selectedMonth)),
    [expenses, selectedMonth],
  )

  const totals = useMemo(
    () =>
      filteredExpenses.reduce(
        (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }),
        {} as Record<string, number>,
      ),
    [filteredExpenses],
  )
  const grand = Object.values(totals).reduce((s, v) => s + v, 0)
  const leftover = salary - grand
  const spentPct = salary > 0 ? Math.min((grand / salary) * 100, 100) : 0

  const monthlyHistory = useMemo(() => {
    const months = [...availableMonths].reverse().slice(-7)
    return months.map((m) => ({
      month: m,
      total: expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0),
    }))
  }, [expenses, availableMonths])

  const handleSaveSalary = async () => {
    const parsed = Number.parseFloat(salaryInput.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed > 0) await updateSalary(todayMonth, parsed)
    setSalaryDialogOpen(false)
  }

  const handleAddExpense = async () => {
    const amount = Number.parseFloat(form.amount.replace(',', '.'))
    if (!form.description.trim() || Number.isNaN(amount) || amount <= 0) return
    await addExpense({
      description: form.description.trim(),
      amount,
      category: form.category,
      date: form.date,
      source: 'manual',
    })
    setForm(emptyForm)
    setAddDialogOpen(false)
  }

  const prevMonth = () => {
    if (currentIndex === -1 && availableMonths.length > 0) setSelectedMonth(availableMonths[0])
    else if (canGoPrev) setSelectedMonth(availableMonths[currentIndex + 1])
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  const maxHistory = Math.max(...monthlyHistory.map((h) => h.total), 1)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">Gastos</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-foreground w-16 text-center">
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              onClick={() => canGoNext && setSelectedMonth(availableMonths[currentIndex - 1])}
              disabled={!canGoNext}
              className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
              <PlusCircle size={15} />
              Adicionar
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar gasto</DialogTitle>
              <DialogDescription>Registre um novo gasto manualmente.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="desc" className="text-sm font-medium text-foreground">
                  Descrição
                </label>
                <input
                  id="desc"
                  className={inputClass}
                  placeholder="Ex: Mercado"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="amount" className="text-sm font-medium text-foreground">
                  Valor (R$)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Categoria
                </label>
                <select
                  id="category"
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
                  }
                >
                  {Object.entries(categoryLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="date" className="text-sm font-medium text-foreground">
                  Data
                </label>
                <input
                  id="date"
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setAddDialogOpen(false)}
                className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                Adicionar
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Salário líquido</CardTitle>
              {isCurrentMonth && (
                <Dialog
                  open={salaryDialogOpen}
                  onOpenChange={(open) => {
                    if (open) setSalaryInput(String(salary || ''))
                    setSalaryDialogOpen(open)
                  }}
                >
                  <DialogTrigger asChild>
                    <button className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                      <Pencil size={14} />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Atualizar salário líquido</DialogTitle>
                      <DialogDescription>Informe o seu salário líquido atual.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                      <label htmlFor="salary" className="text-sm font-medium text-foreground">
                        Salário líquido (R$)
                      </label>
                      <input
                        id="salary"
                        type="number"
                        min="0"
                        step="0.01"
                        value={salaryInput}
                        onChange={(e) => setSalaryInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveSalary()}
                        className={inputClass}
                        placeholder="0,00"
                        autoFocus
                      />
                    </div>
                    <DialogFooter>
                      <button
                        onClick={() => setSalaryDialogOpen(false)}
                        className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveSalary}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                      >
                        Salvar
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <CardValue>{formatCurrency(salary)}</CardValue>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total gasto</CardTitle>
            <CardValue className="text-destructive">{formatCurrency(grand)}</CardValue>
            {salary > 0 && (
              <p className="text-xs text-muted-foreground">{spentPct.toFixed(1)}% do salário</p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobrou</CardTitle>
            <CardValue className={leftover >= 0 ? 'text-success' : 'text-destructive'}>
              {formatCurrency(leftover)}
            </CardValue>
            {salary > 0 && (
              <p className="text-xs text-muted-foreground">
                {((leftover / salary) * 100).toFixed(1)}% do salário
              </p>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Salary bar */}
      {salary > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comprometimento do salário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${spentPct >= 90 ? 'bg-destructive' : spentPct >= 70 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>R$ 0</span>
              <span>{formatCurrency(salary)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly history chart */}
      {monthlyHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-28">
              {monthlyHistory.map((h) => {
                const pct = (h.total / maxHistory) * 100
                const isSelected = h.month === selectedMonth
                return (
                  <button
                    key={h.month}
                    onClick={() => setSelectedMonth(h.month)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={formatCurrency(h.total)}
                  >
                    <span
                      className={`text-[10px] font-medium transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {formatCurrency(h.total)}
                    </span>
                    <div
                      className={`w-full rounded-t transition-colors ${isSelected ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span
                      className={`text-[10px] transition-colors ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                    >
                      {formatMonthLabel(h.month)}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {Object.keys(totals).length > 0 && (
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
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações — {formatMonthLabel(selectedMonth)}</CardTitle>
            <span className="text-xs text-muted-foreground">
              {filteredExpenses.length} registros
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum gasto registrado neste mês.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map((e) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
