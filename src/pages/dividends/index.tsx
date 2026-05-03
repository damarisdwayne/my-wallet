import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { deleteDividend, subscribeToAllDividends } from '@/services/dividends'
import { subscribeToAssets } from '@/services/assets'
import { fetchUsdBrlRate } from '@/services/quotes'
import { useAuth } from '@/store/auth'
import { getDividendBrl } from '@/lib/utils'
import { DividendsSkeleton } from '@/skeleton'
import type { Asset, Dividend } from '@/types'
import { CURRENT_MONTH, THIS_YEAR } from './constants'
import { buildLast12Months, type MonthBreakdown } from './utils'
import { DividendsList, MonthlyChart, SummaryCards } from './components'

export const DividendsPage = () => {
  const { user } = useAuth()
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR)
  const [loading, setLoading] = useState(true)
  const [usdRate, setUsdRate] = useState(0)

  useEffect(() => {
    fetchUsdBrlRate()
      .then(setUsdRate)
      .catch(() => setUsdRate(0))
  }, [])

  useEffect(() => {
    if (!user) return
    let resolved = 0
    const onLoad = () => {
      if (++resolved === 2) setLoading(false)
    }
    const unsubs = [
      subscribeToAllDividends(user.uid, (data) => {
        setDividends(data)
        onLoad()
      }),
      subscribeToAssets(user.uid, (data) => {
        setAssets(data)
        onLoad()
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const tickerType = useMemo(
    () => new Map(assets.map((a) => [a.ticker.toUpperCase(), a.type])),
    [assets],
  )

  const last12Months = useMemo(() => buildLast12Months(), [])

  const last12Dividends = useMemo(() => {
    const from = last12Months[0]
    const to = last12Months[11]
    return dividends.filter((d) => {
      const m = d.paymentDate.slice(0, 7)
      return m >= from && m <= to
    })
  }, [dividends, last12Months])

  const byMonth = useMemo(() => {
    const map = Object.fromEntries(
      last12Months.map((m) => [
        m,
        { total: 0, fii: 0, stock: 0, fixed: 0, ext: 0 } as MonthBreakdown,
      ]),
    )
    for (const d of last12Dividends) {
      const key = d.paymentDate.slice(0, 7)
      if (!(key in map)) continue
      const brl = getDividendBrl(d, usdRate)
      map[key].total += brl
      if (d.type === 'dividendo_ext') {
        map[key].ext += brl
      } else {
        const type = tickerType.get(d.ticker.toUpperCase())
        if (type === 'fii' || type === 'etf') map[key].fii += brl
        else if (type === 'fixed_income') map[key].fixed += brl
        else map[key].stock += brl
      }
    }
    return map
  }, [last12Dividends, last12Months, tickerType, usdRate])

  const total12 = last12Dividends.reduce((s, d) => s + getDividendBrl(d, usdRate), 0)
  const avg12 = total12 / 12
  const totalCurrentMonth = byMonth[CURRENT_MONTH]?.total ?? 0

  const years = useMemo(() => {
    const set = new Set(dividends.map((d) => d.paymentDate.slice(0, 4)))
    if (!set.has(THIS_YEAR)) set.add(THIS_YEAR)
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [dividends])

  const yearDividends = useMemo(
    () => dividends.filter((d) => d.paymentDate.startsWith(selectedYear)),
    [dividends, selectedYear],
  )

  const yearTotal = yearDividends.reduce((s, d) => s + getDividendBrl(d, usdRate), 0)

  if (loading) return <DividendsSkeleton />

  return (
    <div className="p-6 space-y-6">
      <SummaryCards total12={total12} avg12={avg12} totalCurrentMonth={totalCurrentMonth} />

      <Card>
        <CardHeader>
          <CardTitle>Evolução — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart byMonth={byMonth} avg12={avg12} />
        </CardContent>
      </Card>

      <DividendsList
        yearDividends={yearDividends}
        yearTotal={yearTotal}
        selectedYear={selectedYear}
        years={years}
        usdRate={usdRate}
        onSelectYear={setSelectedYear}
        onDelete={(id) => user && deleteDividend(user.uid, id)}
      />
    </div>
  )
}
