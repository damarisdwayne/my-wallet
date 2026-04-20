import { useEffect, useState } from 'react'
import {
  addExpense as addExpenseService,
  setSalary as setSalaryService,
  subscribeSalary,
  subscribeToAllExpenses,
} from '@/services/expenses'
import { useAuth } from '@/store/auth'
import type { Expense } from '@/types'

export const useExpenses = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [salaryByMonth, setSalaryByMonth] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let resolved = 0
    const onLoad = () => {
      resolved++
      if (resolved === 2) setLoading(false)
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
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    if (!user) return Promise.resolve()
    return addExpenseService(user.uid, expense)
  }

  const updateSalary = (month: string, amount: number) => {
    if (!user) return Promise.resolve()
    return setSalaryService(user.uid, month, amount)
  }

  return { expenses, salaryByMonth, loading, addExpense, updateSalary }
}
