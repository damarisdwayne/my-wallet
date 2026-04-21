import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { subscribeToAllDividends } from '@/services/dividends'
import { subscribeToAssets } from '@/services/assets'
import { useAuth } from '@/store/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Asset, Dividend } from '@/types'

const MONTH_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]
const THIS_YEAR = new Date().getFullYear().toString()

const buildLast12Months = (): string[] => {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

const monthLabel = (key: string) => `${MONTH_SHORT[Number(key.slice(5)) - 1]} ${key.slice(2, 4)}`

interface MonthBreakdown {
  total: number
  fii: number
  stock: number
  fixed: number
}

export const DividendsPage = () => {
  const { user } = useAuth()
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR)

  useEffect(() => {
    if (!user) return
    const unsubs = [
      subscribeToAllDividends(user.uid, setDividends),
      subscribeToAssets(user.uid, setAssets),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  // ticker → asset type map (only for tickers present in the portfolio)
  const tickerType = useMemo(
    () => new Map(assets.map((a) => [a.ticker.toUpperCase(), a.type])),
    [assets],
  )

  const last12Months = useMemo(buildLast12Months, [])

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
      last12Months.map((m) => [m, { total: 0, fii: 0, stock: 0, fixed: 0 } as MonthBreakdown]),
    )
    for (const d of last12Dividends) {
      const key = d.paymentDate.slice(0, 7)
      if (!(key in map)) continue
      const type = tickerType.get(d.ticker.toUpperCase())
      map[key].total += d.amount
      if (type === 'fii' || type === 'etf') map[key].fii += d.amount
      else if (type === 'fixed_income') map[key].fixed += d.amount
      else map[key].stock += d.amount
    }
    return map
  }, [last12Dividends, last12Months, tickerType])

  const total12 = last12Dividends.reduce((s, d) => s + d.amount, 0)
  const avg12 = total12 / 12
  const maxMonth = Math.max(...Object.values(byMonth).map((b) => b.total), 1)

  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const totalCurrentMonth = byMonth[currentMonthKey]?.total ?? 0

  const years = useMemo(() => {
    const set = new Set(dividends.map((d) => d.paymentDate.slice(0, 4)))
    if (!set.has(THIS_YEAR)) set.add(THIS_YEAR)
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [dividends])

  const yearDividends = useMemo(
    () => dividends.filter((d) => d.paymentDate.startsWith(selectedYear)),
    [dividends, selectedYear],
  )

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Últimos 12 meses</CardTitle>
            <CardValue>{formatCurrency(total12)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Média mensal</CardTitle>
            <CardValue>{formatCurrency(avg12)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mês atual</CardTitle>
            <CardValue>{formatCurrency(totalCurrentMonth)}</CardValue>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por mês — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1">
            {Object.entries(byMonth).map(([key, b]) => {
              const barHeight = Math.max(2, (b.total / maxMonth) * 100)
              const tooltipLines =
                b.total > 0
                  ? ([
                      b.fii > 0 && `FII: ${formatCurrency(b.fii)}`,
                      b.stock > 0 && `Ações: ${formatCurrency(b.stock)}`,
                      b.fixed > 0 && `Renda Fixa: ${formatCurrency(b.fixed)}`,
                      `Total: ${formatCurrency(b.total)}`,
                    ].filter(Boolean) as string[])
                  : null
              return (
                <div key={key} className="group relative flex-1 flex flex-col items-center gap-1">
                  {tooltipLines && (
                    <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col gap-0.5 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 shadow-md text-xs text-popover-foreground">
                      {tooltipLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  )}
                  {b.total > 0 && (
                    <span
                      className="text-[9px] text-muted-foreground font-medium origin-bottom"
                      style={{
                        transform: 'rotate(-50deg) translate(20px,-4px)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCurrency(b.total)}
                    </span>
                  )}
                  <div
                    className={`w-full rounded-t transition-colors cursor-default bg-success/60 hover:bg-success`}
                    style={{ height: `${barHeight}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{monthLabel(key)}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedYear === y
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          {yearDividends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum provento em {selectedYear}.
            </p>
          ) : (
            <div className="space-y-2">
              {yearDividends.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground w-20">{d.ticker}</span>
                    <Badge
                      variant={
                        d.type === 'rendimento'
                          ? 'default'
                          : d.type === 'jcp'
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {d.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.paymentDate)}
                    </span>
                    {d.ir ? (
                      <span className="text-xs text-muted-foreground">
                        IR: {formatCurrency(d.ir)}
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-success">
                      + {formatCurrency(d.amount)}
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
