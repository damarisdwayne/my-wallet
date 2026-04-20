import { useEffect, useState } from 'react'
import {
  addExpense as addExpenseService,
  addFixedExpense as addFixedExpenseService,
  addInstallmentExpense as addInstallmentExpenseService,
  deleteFixedExpense as deleteFixedExpenseService,
  deleteInstallmentExpense as deleteInstallmentExpenseService,
  setSalary as setSalaryService,
  subscribeSalary,
  subscribeToAllExpenses,
  subscribeToFixedExpenses,
  subscribeToInstallmentExpenses,
} from '@/services/expenses'
import { useAuth } from '@/store/auth'
import type { DisplayExpense, Expense, FixedExpense, InstallmentExpense } from '@/types'
import { monthDiff } from '@/pages/expenses/utils'

export const useExpenses = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [installmentExpenses, setInstallmentExpenses] = useState<InstallmentExpense[]>([])
  const [salaryByMonth, setSalaryByMonth] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let resolved = 0
    const onLoad = () => {
      resolved++
      if (resolved === 4) setLoading(false)
    }
    const unsubs = [
      subscribeToAllExpenses(user.uid, (data) => {
        setExpenses(data)
        onLoad()
      }),
      subscribeSalary(user.uid, (data) => {
        setSalaryByMonth(data)
        onLoad()
      }),
      subscribeToFixedExpenses(user.uid, (data) => {
        setFixedExpenses(data)
        onLoad()
      }),
      subscribeToInstallmentExpenses(user.uid, (data) => {
        setInstallmentExpenses(data)
        onLoad()
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const getRecurringForMonth = (month: string): DisplayExpense[] => {
    const result: DisplayExpense[] = []

    for (const fe of fixedExpenses) {
      const started = monthDiff(fe.startMonth, month) >= 0
      const notEnded = fe.endMonth === undefined || monthDiff(month, fe.endMonth) >= 0
      if (started && notEnded) {
        result.push({
          id: `fixed-${fe.id}-${month}`,
          description: fe.description,
          amount: fe.amount,
          category: fe.category,
          date: `${month}-01`,
          source: 'fixed',
        })
      }
    }

    for (const ie of installmentExpenses) {
      const diff = monthDiff(ie.startMonth, month)
      if (diff >= 0 && diff < ie.installments) {
        result.push({
          id: `installment-${ie.id}-${month}`,
          description: ie.description,
          amount: ie.installmentAmount,
          category: ie.category,
          date: `${month}-01`,
          source: 'installment',
          installmentNumber: diff + 1,
          totalInstallments: ie.installments,
        })
      }
    }

    return result
  }

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    if (!user) return Promise.resolve()
    return addExpenseService(user.uid, expense)
  }

  const updateSalary = (month: string, amount: number) => {
    if (!user) return Promise.resolve()
    return setSalaryService(user.uid, month, amount)
  }

  const addFixedExpense = (item: Omit<FixedExpense, 'id'>) => {
    if (!user) return Promise.resolve()
    return addFixedExpenseService(user.uid, item)
  }

  const deleteFixedExpense = (id: string) => {
    if (!user) return Promise.resolve()
    return deleteFixedExpenseService(user.uid, id)
  }

  const addInstallmentExpense = (item: Omit<InstallmentExpense, 'id'>) => {
    if (!user) return Promise.resolve()
    return addInstallmentExpenseService(user.uid, item)
  }

  const deleteInstallmentExpense = (id: string) => {
    if (!user) return Promise.resolve()
    return deleteInstallmentExpenseService(user.uid, id)
  }

  return {
    expenses,
    fixedExpenses,
    installmentExpenses,
    salaryByMonth,
    loading,
    getRecurringForMonth,
    addExpense,
    updateSalary,
    addFixedExpense,
    deleteFixedExpense,
    addInstallmentExpense,
    deleteInstallmentExpense,
  }
}
