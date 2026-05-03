import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { useExpenses } from '@/hooks/use-expenses'
import type { DisplayExpense, ExpenseCategory } from '@/types'
import { addMonthStr, todayMonth } from './utils'
import { ExpensesSkeleton } from '@/skeletons'
import {
  CategoryBreakdown,
  MonthlyExpensesChart,
  PageHeader,
  RecurringList,
  SalaryBar,
  SummaryCards,
  TransactionsList,
  type MonthPoint,
} from './components'

export const ExpensesPage = () => {
  const {
    expenses,
    fixedExpenses,
    installmentExpenses,
    salaryByMonth,
    loading,
    addExpense,
    addExpenses,
    deleteExpense,
    updateSalary,
    getRecurringForMonth,
    addFixedExpense,
    deleteFixedExpense,
    addInstallmentExpense,
    deleteInstallmentExpense,
  } = useExpenses()

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

  const monthlyHistory = useMemo((): MonthPoint[] => {
    const months = [...availableMonths].reverse().slice(-12)
    return months.map((m) => {
      const all = [...expenses.filter((e) => e.date.startsWith(m)), ...getRecurringForMonth(m)]
      const byCategory: Partial<Record<ExpenseCategory, number>> = {}
      for (const e of all) byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
      return { month: m, total: all.reduce((s, e) => s + e.amount, 0), byCategory }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, availableMonths, fixedExpenses, installmentExpenses])

  if (loading) return <ExpensesSkeleton />

  const grand = Object.values(totals).reduce((s, v) => s + v, 0)
  const leftover = salary - grand
  const spentPct = salary > 0 ? Math.min((grand / salary) * 100, 100) : 0
  const isCurrentMonth = selectedMonth === todayMonth
  const currentIndex = availableMonths.indexOf(selectedMonth)
  const canGoPrev =
    currentIndex === -1 ? availableMonths.length > 0 : currentIndex < availableMonths.length - 1
  const canGoNext = currentIndex > 0

  const prevMonth = () => {
    if (currentIndex === -1 && availableMonths.length > 0) setSelectedMonth(availableMonths[0])
    else if (canGoPrev) setSelectedMonth(availableMonths[currentIndex + 1])
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        selectedMonth={selectedMonth}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={prevMonth}
        onNext={() => canGoNext && setSelectedMonth(availableMonths[currentIndex - 1])}
        onImport={addExpenses}
        onAddFixed={async (item) => {
          await addFixedExpense(item)
        }}
        onAddInstallment={async (item) => {
          await addInstallmentExpense(item)
        }}
        onAddExpense={async (expense) => {
          await addExpense(expense)
        }}
      />

      <SummaryCards
        salary={salary}
        grand={grand}
        leftover={leftover}
        spentPct={spentPct}
        isCurrentMonth={isCurrentMonth}
        onSaveSalary={(amount) => updateSalary(todayMonth, amount)}
      />

      <SalaryBar salary={salary} grand={grand} spentPct={spentPct} totals={totals} />

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

      <CategoryBreakdown totals={totals} grand={grand} />

      <RecurringList
        fixedExpenses={fixedExpenses}
        installmentExpenses={installmentExpenses}
        onDeleteFixed={deleteFixedExpense}
        onDeleteInstallment={deleteInstallmentExpense}
      />

      <TransactionsList
        entries={allEntries}
        selectedMonth={selectedMonth}
        onDelete={deleteExpense}
      />
    </div>
  )
}
