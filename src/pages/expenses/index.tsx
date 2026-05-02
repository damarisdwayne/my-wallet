import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, PlusCircle, Repeat2, Trash2 } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/hooks/use-expenses'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { DisplayExpense, ExpenseCategory, FixedExpense } from '@/types'
import {
  CATEGORY_SVG_COLORS,
  addMonthStr,
  categoryColors,
  categoryLabel,
  emptyForm,
  formatMonthLabel,
  todayMonth,
} from './utils'

const ExpensesSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(['salary', 'spent', 'left'] as const).map((k) => (
        <Card key={k}>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-36 mt-1" />
            <Skeleton className="h-3 w-20 mt-1" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full rounded-full" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-28">
          {([60, 90, 50, 100, 75, 45, 80] as const).map((h) => (
            <div key={h} className="flex-1 flex flex-col items-center gap-1">
              <Skeleton className="w-full rounded-t" style={{ height: `${h}px` }} />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => (
            <div
              key={k}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

const emptyFixed = {
  description: '',
  amount: '',
  category: 'housing' as ExpenseCategory,
  startMonth: todayMonth,
  endMonth: '',
}

const emptyInstallment = {
  description: '',
  totalAmount: '',
  installments: '',
  category: 'housing' as ExpenseCategory,
  startMonth: todayMonth,
}

interface MonthPoint {
  month: string
  total: number
  byCategory: Partial<Record<ExpenseCategory, number>>
}

const CATEGORIES = Object.keys(CATEGORY_SVG_COLORS) as ExpenseCategory[]

const W = 600
const H = 220
const PAD_L = 48
const PAD_R = 12
const PAD_T = 16
const PAD_B = 36
const CHART_W = W - PAD_L - PAD_R
const CHART_H = H - PAD_T - PAD_B

const MonthlyExpensesChart = ({
  data,
  selectedMonth,
  onSelectMonth,
}: {
  data: MonthPoint[]
  selectedMonth: string
  onSelectMonth: (m: string) => void
}) => {
  const [tooltip, setTooltip] = useState<{ pct: number; point: MonthPoint } | null>(null)

  const niceMax = Math.ceil(Math.max(...data.map((d) => d.total), 1) / 500) * 500
  const barW = data.length > 0 ? CHART_W / data.length : 0
  const barPad = Math.max(barW * 0.15, (barW - 50) / 2)
  const bw = barW - barPad * 2
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax)

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {gridLines.map((val) => {
          const y = PAD_T + CHART_H - (val / niceMax) * CHART_H
          return (
            <g key={val}>
              <line
                x1={PAD_L}
                y1={y}
                x2={W - PAD_R}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={1}
              />
              <text
                x={PAD_L - 5}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="currentColor"
                opacity={0.4}
              >
                {val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : val}
              </text>
            </g>
          )
        })}

        {data.map((point, i) => {
          const x = PAD_L + i * barW
          const barX = x + barPad
          const isSelected = point.month === selectedMonth
          const segments = CATEGORIES.filter((c) => (point.byCategory[c] ?? 0) > 0).map((c) => ({
            cat: c,
            value: point.byCategory[c]!,
          }))
          let stackY = PAD_T + CHART_H

          return (
            <g
              key={point.month}
              className="cursor-pointer"
              onClick={() => onSelectMonth(point.month)}
              onMouseEnter={() =>
                setTooltip({ pct: ((barX + bw / 2) / W) * 100, point })
              }
            >
              {isSelected && (
                <rect
                  x={x + 2}
                  y={PAD_T}
                  width={barW - 4}
                  height={CHART_H}
                  rx={3}
                  fill="currentColor"
                  opacity={0.06}
                />
              )}
              {segments.map(({ cat, value }, si) => {
                const bh = Math.max((value / niceMax) * CHART_H, 1)
                stackY -= bh
                const isTop = si === segments.length - 1
                return (
                  <rect
                    key={cat}
                    x={barX}
                    y={stackY}
                    width={bw}
                    height={bh}
                    fill={CATEGORY_SVG_COLORS[cat]}
                    opacity={isSelected ? 1 : 0.65}
                    rx={isTop ? 2 : 0}
                  />
                )
              })}
              <text
                x={barX + bw / 2}
                y={H - PAD_B + 14}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                opacity={isSelected ? 1 : 0.45}
                fontWeight={isSelected ? '600' : '400'}
              >
                {formatMonthLabel(point.month)}
              </text>
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-popover border border-border rounded-lg shadow-lg p-2.5 text-xs min-w-[150px]"
          style={{ left: `${tooltip.pct}%`, top: '0%', transform: 'translate(-50%, 0)' }}
        >
          <p className="font-semibold text-foreground mb-1.5">
            {formatMonthLabel(tooltip.point.month)}
          </p>
          {CATEGORIES.filter((c) => (tooltip.point.byCategory[c] ?? 0) > 0)
            .sort((a, b) => (tooltip.point.byCategory[b] ?? 0) - (tooltip.point.byCategory[a] ?? 0))
            .map((c) => (
              <div key={c} className="flex items-center justify-between gap-3 py-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_SVG_COLORS[c] }}
                  />
                  <span className="text-muted-foreground">{categoryLabel[c]}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(tooltip.point.byCategory[c]!)}
                </span>
              </div>
            ))}
          <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(tooltip.point.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export const ExpensesPage = () => {
  const {
    expenses,
    fixedExpenses,
    installmentExpenses,
    salaryByMonth,
    loading,
    addExpense,
    updateSalary,
    getRecurringForMonth,
    addFixedExpense,
    deleteFixedExpense,
    addInstallmentExpense,
    deleteInstallmentExpense,
  } = useExpenses()

  const [salaryInput, setSalaryInput] = useState('')
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFixedOpen, setAddFixedOpen] = useState(false)
  const [addInstallmentOpen, setAddInstallmentOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [fixedForm, setFixedForm] = useState(emptyFixed)
  const [installmentForm, setInstallmentForm] = useState(emptyInstallment)
  const [selectedMonth, setSelectedMonth] = useState<string>(todayMonth)

  const availableMonths = useMemo(() => {
    const seeds = [
      ...expenses.map((e) => e.date.slice(0, 7)),
      ...Object.keys(salaryByMonth),
      ...fixedExpenses.map((fe) => fe.startMonth),
      ...installmentExpenses.map((ie) => ie.startMonth),
    ]
    if (seeds.length === 0) return []
    const earliest = seeds.reduce((a, b) => (a < b ? a : b))
    const months: string[] = []
    let cur = earliest
    while (cur <= todayMonth) {
      months.push(cur)
      cur = addMonthStr(cur, 1)
    }
    return months.sort((a, b) => b.localeCompare(a))
  }, [expenses, salaryByMonth, fixedExpenses, installmentExpenses])

  const salary = useMemo(() => {
    if (salaryByMonth[selectedMonth] !== undefined) return salaryByMonth[selectedMonth]
    const lastRecorded = Object.keys(salaryByMonth)
      .filter((m) => m <= selectedMonth)
      .sort()
      .at(-1)
    return lastRecorded !== undefined ? salaryByMonth[lastRecorded] : 0
  }, [salaryByMonth, selectedMonth])
  const isCurrentMonth = selectedMonth === todayMonth

  const currentIndex = availableMonths.indexOf(selectedMonth)
  const canGoPrev =
    currentIndex === -1 ? availableMonths.length > 0 : currentIndex < availableMonths.length - 1
  const canGoNext = currentIndex > 0

  const recurringEntries = useMemo(
    () => getRecurringForMonth(selectedMonth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMonth, fixedExpenses, installmentExpenses],
  )

  const manualEntries = useMemo(
    (): DisplayExpense[] =>
      expenses
        .filter((e) => e.date.startsWith(selectedMonth))
        .map((e) => ({ ...e, source: e.source as DisplayExpense['source'] })),
    [expenses, selectedMonth],
  )

  const allEntries = useMemo(
    () => [...manualEntries, ...recurringEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [manualEntries, recurringEntries],
  )

  const totals = useMemo(
    () =>
      allEntries.reduce(
        (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }),
        {} as Record<string, number>,
      ),
    [allEntries],
  )
  const grand = Object.values(totals).reduce((s, v) => s + v, 0)
  const leftover = salary - grand
  const spentPct = salary > 0 ? Math.min((grand / salary) * 100, 100) : 0

  const monthlyHistory = useMemo((): MonthPoint[] => {
    const months = [...availableMonths].reverse().slice(-12)
    return months.map((m) => {
      const all = [
        ...expenses.filter((e) => e.date.startsWith(m)),
        ...getRecurringForMonth(m),
      ]
      const byCategory: Partial<Record<ExpenseCategory, number>> = {}
      for (const e of all) {
        byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
      }
      return { month: m, total: all.reduce((s, e) => s + e.amount, 0), byCategory }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, availableMonths, fixedExpenses, installmentExpenses])

  if (loading) return <ExpensesSkeleton />

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

  const handleAddFixed = async () => {
    const amount = Number.parseFloat(fixedForm.amount.replace(',', '.'))
    if (!fixedForm.description.trim() || Number.isNaN(amount) || amount <= 0) return
    const item: Omit<FixedExpense, 'id'> = {
      description: fixedForm.description.trim(),
      amount,
      category: fixedForm.category,
      startMonth: fixedForm.startMonth,
      createdAt: new Date().toISOString(),
    }
    if (fixedForm.endMonth) item.endMonth = fixedForm.endMonth
    await addFixedExpense(item)
    setFixedForm(emptyFixed)
    setAddFixedOpen(false)
  }

  const handleAddInstallment = async () => {
    const total = Number.parseFloat(installmentForm.totalAmount.replace(',', '.'))
    const n = Number.parseInt(installmentForm.installments, 10)
    if (!installmentForm.description.trim() || Number.isNaN(total) || total <= 0 || !n || n < 2)
      return
    await addInstallmentExpense({
      description: installmentForm.description.trim(),
      totalAmount: total,
      installments: n,
      installmentAmount: Math.round((total / n) * 100) / 100,
      startMonth: installmentForm.startMonth,
      category: installmentForm.category,
      createdAt: new Date().toISOString(),
    })
    setInstallmentForm(emptyInstallment)
    setAddInstallmentOpen(false)
  }

  const prevMonth = () => {
    if (currentIndex === -1 && availableMonths.length > 0) setSelectedMonth(availableMonths[0])
    else if (canGoPrev) setSelectedMonth(availableMonths[currentIndex + 1])
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  const sourceLabel: Record<DisplayExpense['source'], string> = {
    manual: 'manual',
    bank: 'banco',
    fixed: 'fixo',
    installment: 'parcela',
  }

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

        <div className="flex items-center gap-2">
          <Dialog open={addFixedOpen} onOpenChange={setAddFixedOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors">
                <Repeat2 size={15} />
                Fixo
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar gasto fixo</DialogTitle>
                <DialogDescription>
                  Aparecerá automaticamente em todos os meses até ser removido.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <input
                    className={inputClass}
                    placeholder="Ex: Condomínio"
                    value={fixedForm.description}
                    onChange={(e) => setFixedForm((f) => ({ ...f, description: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Valor mensal (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="0,00"
                    value={fixedForm.amount}
                    onChange={(e) => setFixedForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <select
                    className={inputClass}
                    value={fixedForm.category}
                    onChange={(e) =>
                      setFixedForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
                    }
                  >
                    {Object.entries(categoryLabel).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Início (mês)</label>
                    <input
                      type="month"
                      className={inputClass}
                      value={fixedForm.startMonth}
                      onChange={(e) => setFixedForm((f) => ({ ...f, startMonth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Fim (opcional)</label>
                    <input
                      type="month"
                      className={inputClass}
                      value={fixedForm.endMonth}
                      onChange={(e) => setFixedForm((f) => ({ ...f, endMonth: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={() => setAddFixedOpen(false)}
                  className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddFixed}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  Adicionar
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addInstallmentOpen} onOpenChange={setAddInstallmentOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors">
                <PlusCircle size={15} />
                Parcelado
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar gasto parcelado</DialogTitle>
                <DialogDescription>
                  O valor será dividido pelo número de parcelas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <input
                    className={inputClass}
                    placeholder="Ex: TV Samsung 65'"
                    value={installmentForm.description}
                    onChange={(e) =>
                      setInstallmentForm((f) => ({ ...f, description: e.target.value }))
                    }
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Valor total (R$)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      placeholder="0,00"
                      value={installmentForm.totalAmount}
                      onChange={(e) =>
                        setInstallmentForm((f) => ({ ...f, totalAmount: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nº parcelas</label>
                    <input
                      type="number"
                      min="2"
                      step="1"
                      className={inputClass}
                      placeholder="12"
                      value={installmentForm.installments}
                      onChange={(e) =>
                        setInstallmentForm((f) => ({ ...f, installments: e.target.value }))
                      }
                    />
                  </div>
                </div>
                {installmentForm.totalAmount && installmentForm.installments && (
                  <p className="text-sm text-muted-foreground">
                    Parcela:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(
                        Math.round(
                          (Number.parseFloat(installmentForm.totalAmount.replace(',', '.')) /
                            Number.parseInt(installmentForm.installments, 10)) *
                            100,
                        ) / 100,
                      )}
                    </span>
                    /mês
                  </p>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <select
                    className={inputClass}
                    value={installmentForm.category}
                    onChange={(e) =>
                      setInstallmentForm((f) => ({
                        ...f,
                        category: e.target.value as ExpenseCategory,
                      }))
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
                  <label className="text-sm font-medium text-foreground">Mês inicial</label>
                  <input
                    type="month"
                    className={inputClass}
                    value={installmentForm.startMonth}
                    onChange={(e) =>
                      setInstallmentForm((f) => ({ ...f, startMonth: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={() => setAddInstallmentOpen(false)}
                  className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddInstallment}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  Adicionar
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
            <div className="w-full h-5 rounded-full overflow-hidden flex bg-muted">
              {Object.entries(totals).map(([cat, val]) => (
                <div
                  key={cat}
                  style={{
                    width: `${(val / salary) * 100}%`,
                    background: CATEGORY_SVG_COLORS[cat as ExpenseCategory],
                  }}
                  title={`${categoryLabel[cat as ExpenseCategory]}: ${formatCurrency(val)}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>
                <span className={spentPct >= 90 ? 'text-destructive' : spentPct >= 70 ? 'text-warning' : 'text-foreground'}>
                  {spentPct.toFixed(1)}%
                </span>{' '}
                comprometido — {formatCurrency(grand)}
              </span>
              <span>{formatCurrency(salary)}</span>
            </div>
            {Object.keys(totals).length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-border">
                {Object.entries(totals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, val]) => (
                    <div key={cat} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: CATEGORY_SVG_COLORS[cat as ExpenseCategory] }}
                      />
                      <span className="text-muted-foreground">{categoryLabel[cat as ExpenseCategory]}</span>
                      <span className="font-medium text-foreground">{formatCurrency(val)}</span>
                    </div>
                  ))}
              </div>
            )}
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
            <MonthlyExpensesChart
              data={monthlyHistory}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
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

      {/* Recurring rules management */}
      {(fixedExpenses.length > 0 || installmentExpenses.length > 0) && (
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
                    <Badge variant={categoryColors[fe.category]}>
                      {categoryLabel[fe.category]}
                    </Badge>
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
                      onClick={() => deleteFixedExpense(fe.id)}
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
                    <Badge variant={categoryColors[ie.category]}>
                      {categoryLabel[ie.category]}
                    </Badge>
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
                      onClick={() => deleteInstallmentExpense(ie.id)}
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
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações — {formatMonthLabel(selectedMonth)}</CardTitle>
            <span className="text-xs text-muted-foreground">{allEntries.length} registros</span>
          </div>
        </CardHeader>
        <CardContent>
          {allEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum gasto registrado neste mês.
            </p>
          ) : (
            <div className="space-y-2">
              {allEntries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
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
                      {sourceLabel[e.source]}
                    </span>
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
