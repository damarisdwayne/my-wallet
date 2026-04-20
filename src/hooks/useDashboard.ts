import { useEffect, useState } from 'react'
import { subscribeToAssets } from '@/services/assets'
import { subscribeToMonthlyDividends } from '@/services/dividends'
import { subscribeToMonthlyExpenses } from '@/services/expenses'
import { subscribeToPatrimonyHistory, type PatrimonyPoint } from '@/services/patrimony'
import { useAuth } from '@/store/auth'
import type { Asset, Dividend, Expense } from '@/types'

const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

export const useDashboard = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [patrimonyHistory, setPatrimonyHistory] = useState<PatrimonyPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let resolved = 0
    const onLoad = () => {
      resolved++
      if (resolved === 4) setLoading(false)
    }

    const unsubs = [
      subscribeToAssets(user.uid, (data) => { setAssets(data); onLoad() }),
      subscribeToMonthlyDividends(user.uid, currentMonth, (data) => { setDividends(data); onLoad() }),
      subscribeToMonthlyExpenses(user.uid, currentMonth, (data) => { setExpenses(data); onLoad() }),
      subscribeToPatrimonyHistory(user.uid, (data) => { setPatrimonyHistory(data); onLoad() }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [user])

  const totalPatrimony = assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
  const totalCost = assets.reduce((s, a) => s + a.avgPrice * a.quantity, 0)
  const totalReturn = totalCost > 0 ? ((totalPatrimony - totalCost) / totalCost) * 100 : 0
  const monthlyDividends = dividends.reduce((s, d) => s + d.amount, 0)
  const monthlyExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  return {
    loading,
    totalPatrimony,
    totalCost,
    totalReturn,
    monthlyDividends,
    monthlyExpenses,
    patrimonyHistory,
  }
}