import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { subscribeToAllDividends } from '@/services/dividends'
import { subscribeToAssets } from '@/services/assets'
import { useAuth } from '@/store/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Asset, Dividend } from '@/types'

/* ─── constants ─── */

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const THIS_YEAR = new Date().getFullYear().toString()
const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

const buildLast12Months = (): string[] => {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

const fmtMonth = (key: string) => `${MONTH_SHORT[Number(key.slice(5)) - 1]}/${key.slice(2, 4)}`

const fmtCompact = (v: number) => {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`
  return `R$${v.toFixed(0)}`
}

/* ─── chart geometry ─── */

const W = 800
const H = 280
const PAD = { top: 24, right: 20, bottom: 44, left: 72 }
const CW = W - PAD.left - PAD.right
const CH = H - PAD.top - PAD.bottom
const Y_TICKS = 5

/* ─── types ─── */

interface MonthBreakdown {
  total: number
  fii: number
  stock: number
  fixed: number
}

/* ─── SVG bar chart ─── */

const MonthlyChart = ({
  byMonth,
  avg12,
}: {
  byMonth: Record<string, MonthBreakdown>
  avg12: number
}) => {
  const [hovIdx, setHovIdx] = useState<number | null>(null)

  const entries = Object.entries(byMonth)
  const n = entries.length
  const maxVal = Math.max(...entries.map(([, b]) => b.total), 1)
  const yMax = maxVal * 1.18

  const barSpacing = CW / n
  const barW = barSpacing * 0.55

  const toY = (v: number) => PAD.top + CH - (v / yMax) * CH

  const yTicks = Array.from({ length: Y_TICKS }, (_, i) => ({
    v: (i / (Y_TICKS - 1)) * yMax,
    y: toY((i / (Y_TICKS - 1)) * yMax),
  }))

  const avgY = toY(avg12)

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rawX = ((e.clientX - rect.left) / rect.width) * W - PAD.left
    setHovIdx(Math.max(0, Math.min(n - 1, Math.floor(rawX / barSpacing))))
  }

  const FII_COLOR = 'hsl(142 71% 45%)'
  const STOCK_COLOR = 'hsl(217 91% 60%)'
  const FIXED_COLOR = 'hsl(48 96% 53%)'

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovIdx(null)}
      >
        {/* y-axis gridlines + labels */}
        {yTicks.map(({ v, y }, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y}
              stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={y}
              textAnchor="end" dominantBaseline="middle"
              fontSize="11" fill="currentColor" opacity="0.45"
            >
              {fmtCompact(v)}
            </text>
          </g>
        ))}

        {/* average dashed line */}
        {avg12 > 0 && (
          <g>
            <line
              x1={PAD.left} y1={avgY} x2={PAD.left + CW} y2={avgY}
              stroke="hsl(var(--primary))" strokeOpacity="0.5"
              strokeWidth="1.5" strokeDasharray="6 4"
            />
            <text
              x={PAD.left + CW + 4} y={avgY}
              dominantBaseline="middle" fontSize="10"
              fill="hsl(var(--primary))" opacity="0.7"
            >
              méd
            </text>
          </g>
        )}

        {/* bars */}
        {entries.map(([key, b], i) => {
          const barLeft = PAD.left + i * barSpacing + (barSpacing - barW) / 2
          const isHov = hovIdx === i
          const isCurrent = key === CURRENT_MONTH

          // stack from bottom: fii → stock → fixed
          const segments: { v: number; color: string }[] = [
            { v: b.fii, color: FII_COLOR },
            { v: b.stock, color: STOCK_COLOR },
            { v: b.fixed, color: FIXED_COLOR },
          ].filter((s) => s.v > 0)

          let stackTop = PAD.top + CH
          const rects = segments.map((s, si) => {
            const h = Math.max((s.v / yMax) * CH, 1)
            const y = stackTop - h
            stackTop -= h
            const isTop = si === segments.length - 1
            return { y, h, color: s.color, isTop }
          })

          return (
            <g key={key}>
              {isHov && (
                <rect
                  x={barLeft - 3} y={PAD.top}
                  width={barW + 6} height={CH}
                  fill="currentColor" fillOpacity="0.06" rx="3"
                />
              )}
              {rects.map((r, ri) => (
                <rect
                  key={ri}
                  x={barLeft} y={r.y}
                  width={barW} height={r.h}
                  fill={r.color}
                  fillOpacity={isHov ? 1 : 0.72}
                  rx={r.isTop ? 2 : 0}
                />
              ))}
              {isCurrent && (
                <rect
                  x={barLeft} y={PAD.top + CH + 6}
                  width={barW} height={3}
                  fill="hsl(var(--primary))" rx="1.5"
                />
              )}
              <text
                x={barLeft + barW / 2} y={PAD.top + CH + 20}
                textAnchor="middle" fontSize="11"
                fill="currentColor"
                opacity={isCurrent ? 1 : 0.45}
                fontWeight={isCurrent ? '600' : 'normal'}
              >
                {fmtMonth(key)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* floating tooltip */}
      {hovIdx !== null && (() => {
        const [key, b] = entries[hovIdx]
        if (b.total === 0) return null
        const barCenterX = PAD.left + hovIdx * barSpacing + barSpacing / 2
        const leftPct = (barCenterX / W) * 100

        return (
          <div
            className="pointer-events-none absolute z-10 top-0 rounded-md border border-border bg-popover px-3 py-2 shadow-md text-xs space-y-1"
            style={{
              left: `${leftPct}%`,
              transform: leftPct > 65 ? 'translate(-110%, 32px)' : 'translate(8px, 32px)',
            }}
          >
            <p className="font-semibold text-foreground text-sm border-b border-border pb-1 mb-1">
              {fmtMonth(key)}
            </p>
            {b.fii > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FII_COLOR }} />
                <span className="text-muted-foreground">FII/ETF</span>
                <span className="ml-auto font-medium">{formatCurrency(b.fii)}</span>
              </p>
            )}
            {b.stock > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: STOCK_COLOR }} />
                <span className="text-muted-foreground">Ações</span>
                <span className="ml-auto font-medium">{formatCurrency(b.stock)}</span>
              </p>
            )}
            {b.fixed > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FIXED_COLOR }} />
                <span className="text-muted-foreground">Renda Fixa</span>
                <span className="ml-auto font-medium">{formatCurrency(b.fixed)}</span>
              </p>
            )}
            <p className="flex items-center gap-2 border-t border-border pt-1 mt-1">
              <span className="text-muted-foreground">Total</span>
              <span className="ml-auto font-bold text-success">{formatCurrency(b.total)}</span>
            </p>
          </div>
        )
      })()}

      {/* legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: FII_COLOR }} />
          FII / ETF
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STOCK_COLOR }} />
          Ações
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: FIXED_COLOR }} />
          Renda Fixa
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="w-5 border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--primary))' }} />
          Média
        </span>
      </div>
    </div>
  )
}

/* ─── skeleton ─── */

const DividendsSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map((k) => (
        <Card key={k}>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-36 mt-1" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader><Skeleton className="h-4 w-48" /></CardHeader>
      <CardContent><Skeleton className="h-64 w-full" /></CardContent>
    </Card>
    <Card>
      <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
      <CardContent><Skeleton className="h-48 w-full" /></CardContent>
    </Card>
  </div>
)

/* ─── page ─── */

export const DividendsPage = () => {
  const { user } = useAuth()
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let resolved = 0
    const onLoad = () => { if (++resolved === 2) setLoading(false) }
    const unsubs = [
      subscribeToAllDividends(user.uid, (data) => { setDividends(data); onLoad() }),
      subscribeToAssets(user.uid, (data) => { setAssets(data); onLoad() }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

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

  const yearTotal = yearDividends.reduce((s, d) => s + d.amount, 0)

  if (loading) return <DividendsSkeleton />

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
          <CardTitle>Evolução — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart byMonth={byMonth} avg12={avg12} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <CardTitle>Histórico</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedYear === y ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          {yearDividends.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Total em {selectedYear}:{' '}
              <span className="font-semibold text-foreground">{formatCurrency(yearTotal)}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          {yearDividends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum provento em {selectedYear}.
            </p>
          ) : (
            <div>
              {yearDividends.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/20 -mx-1 px-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground w-20">{d.ticker}</span>
                    <Badge
                      variant={d.type === 'rendimento' ? 'default' : d.type === 'jcp' ? 'warning' : 'success'}
                    >
                      {d.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDate(d.paymentDate)}
                    </span>
                    {d.ir ? (
                      <span className="text-xs text-muted-foreground">
                        IR: {formatCurrency(d.ir)}
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-success">
                      +{formatCurrency(d.amount)}
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
