import { useEffect, useMemo, useState } from 'react'
import { subscribeToAssets } from '@/services/assets'
import { subscribeToAllDividends } from '@/services/dividends'
import { subscribeToPatrimonyHistory, savePatrimonySnapshot, type PatrimonyPoint } from '@/services/patrimony'
import { useExpenses } from '@/hooks/use-expenses'
import { useAuth } from '@/store/auth'
import type { Asset, AssetType, Dividend } from '@/types'

export const CURRENT_MONTH = new Date().toISOString().slice(0, 7)
const CURRENT_YEAR = new Date().getFullYear().toString()

export interface AllocationSlice {
  type: AssetType
  label: string
  value: number
  pct: number
  color: string
}

const TYPE_META: Record<AssetType, { label: string; color: string }> = {
  stock: { label: 'Ações BR', color: 'hsl(217 91% 60%)' },
  fii: { label: 'FII', color: 'hsl(142 71% 45%)' },
  etf: { label: 'ETF BR', color: 'hsl(262 83% 58%)' },
  bdr: { label: 'BDR', color: 'hsl(32 98% 56%)' },
  tesouro: { label: 'Tesouro Direto', color: 'hsl(204 70% 53%)' },
  fixed_income: { label: 'Renda Fixa', color: 'hsl(48 96% 53%)' },
  crypto: { label: 'Cripto', color: 'hsl(0 84% 60%)' },
  stock_us: { label: 'Ações EUA', color: 'hsl(199 89% 48%)' },
  etf_us: { label: 'ETF EUA', color: 'hsl(280 67% 58%)' },
  other: { label: 'Outros', color: 'hsl(220 9% 46%)' },
}

export const useDashboard = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [patrimonyHistory, setPatrimonyHistory] = useState<PatrimonyPoint[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [dividendsLoading, setDividendsLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)

  // useExpenses already handles fixed + installment subscriptions
  const { expenses, salaryByMonth, getRecurringForMonth, loading: expensesLoading } = useExpenses()

  useEffect(() => {
    if (!user) return
    const unsubs = [
      subscribeToAssets(user.uid, (data) => {
        setAssets(data)
        setAssetsLoading(false)
      }),
      subscribeToAllDividends(user.uid, (data) => {
        setDividends(data)
        setDividendsLoading(false)
      }),
      subscribeToPatrimonyHistory(user.uid, (data) => {
        setPatrimonyHistory(data)
        setHistoryLoading(false)
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const loading = assetsLoading || dividendsLoading || historyLoading || expensesLoading

  /* ── portfolio numbers ── */
  const totalPatrimony = assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)

  // Salva snapshot do mês atual — sobrescreve o mesmo doc, nunca cria duplicatas
  useEffect(() => {
    if (loading || totalPatrimony === 0 || !user) return
    savePatrimonySnapshot(user.uid, CURRENT_MONTH, totalPatrimony)
  }, [loading, totalPatrimony, user])
  const totalCost = assets.reduce((s, a) => s + a.avgPrice * a.quantity, 0)
  const totalReturn = totalCost > 0 ? ((totalPatrimony - totalCost) / totalCost) * 100 : 0
  const totalGain = totalPatrimony - totalCost

  /* ── salary for current month (fallback to last recorded) ── */
  const monthlySalary = useMemo(() => {
    if (salaryByMonth[CURRENT_MONTH] !== undefined) return salaryByMonth[CURRENT_MONTH]
    const last = Object.keys(salaryByMonth)
      .filter((m) => m <= CURRENT_MONTH)
      .sort((a, b) => a.localeCompare(b))
      .at(-1)
    return last === undefined ? 0 : salaryByMonth[last]
  }, [salaryByMonth])

  /* ── monthly expenses (manual + fixed + installment) ── */
  const monthlyExpenses = useMemo(() => {
    const manual = expenses
      .filter((e) => e.date.startsWith(CURRENT_MONTH))
      .reduce((s, e) => s + e.amount, 0)
    const recurring = getRecurringForMonth(CURRENT_MONTH).reduce((s, e) => s + e.amount, 0)
    return manual + recurring
  }, [expenses, getRecurringForMonth])

  /* ── dividends ── */
  const monthlyDividends = useMemo(
    () =>
      dividends
        .filter((d) => d.paymentDate.startsWith(CURRENT_MONTH))
        .reduce((s, d) => s + d.amount, 0),
    [dividends],
  )

  const yearDividends = useMemo(
    () =>
      dividends
        .filter((d) => d.paymentDate.startsWith(CURRENT_YEAR))
        .reduce((s, d) => s + d.amount, 0),
    [dividends],
  )

  const last12Dividends = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`
    return dividends
      .filter((d) => d.paymentDate.slice(0, 7) >= cutoffStr)
      .reduce((s, d) => s + d.amount, 0)
  }, [dividends])

  /* ── allocation by type ── */
  const allocation = useMemo<AllocationSlice[]>(() => {
    const byType: Partial<Record<AssetType, number>> = {}
    for (const a of assets) {
      const v = a.currentPrice * a.quantity
      byType[a.type] = (byType[a.type] ?? 0) + v
    }
    return (Object.entries(byType) as [AssetType, number][])
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([type, value]) => ({
        type,
        label: TYPE_META[type].label,
        value,
        pct: totalPatrimony > 0 ? (value / totalPatrimony) * 100 : 0,
        color: TYPE_META[type].color,
      }))
  }, [assets, totalPatrimony])

  return {
    loading,
    totalPatrimony,
    totalCost,
    totalReturn,
    totalGain,
    monthlySalary,
    monthlyDividends,
    yearDividends,
    last12Dividends,
    monthlyExpenses,
    patrimonyHistory,
    allocation,
  }
}
