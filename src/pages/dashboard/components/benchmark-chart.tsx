import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchBenchmarks } from '@/services/bcb'
import type { PatrimonyPoint } from '@/services/patrimony'

interface Props {
  patrimonyHistory: PatrimonyPoint[]
  totalPatrimony: number
  loading: boolean
}

type Range = '6M' | '1A' | 'MAX'
const RANGES: Range[] = ['6M', '1A', 'MAX']

const COLORS = { portfolio: '#22c55e', cdi: '#3b82f6', ipca: '#f97316' }

const formatMonth = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${m}/${y.slice(2)}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{formatMonth(label)}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium" style={{ color: p.color }}>
            {p.value === null ? '—' : `${p.value >= 0 ? '+' : ''}${p.value.toFixed(2)}%`}
          </span>
        </div>
      ))}
    </div>
  )
}

export const BenchmarkChart = ({ patrimonyHistory, totalPatrimony, loading }: Props) => {
  const [range, setRange] = useState<Range>('MAX')
  const [benchmarks, setBenchmarks] = useState<{
    cdi: Record<string, number>
    ipca: Record<string, number>
  } | null>(null)
  const [benchLoading, setBenchLoading] = useState(false)
  const [benchError, setBenchError] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  const fullHistory = useMemo(() => {
    const last = patrimonyHistory.at(-1)
    if (last?.month === currentMonth)
      return [...patrimonyHistory.slice(0, -1), { month: currentMonth, value: totalPatrimony }]
    if (totalPatrimony > 0)
      return [...patrimonyHistory, { month: currentMonth, value: totalPatrimony }]
    return patrimonyHistory
  }, [patrimonyHistory, totalPatrimony, currentMonth])

  const sliced = useMemo(() => {
    if (range === 'MAX') return fullHistory
    return fullHistory.slice(range === '6M' ? -6 : -12)
  }, [fullHistory, range])

  const firstMonth = sliced[0]?.month ?? currentMonth

  useEffect(() => {
    if (sliced.length < 2) return
    setBenchLoading(true)
    setBenchError(false)
    fetchBenchmarks(firstMonth)
      .then(setBenchmarks)
      .catch(() => setBenchError(true))
      .finally(() => setBenchLoading(false))
  }, [firstMonth, sliced.length])

  const chartData = useMemo(() => {
    if (sliced.length === 0) return []
    const base = sliced[0].value
    return sliced.map((p) => {
      const portfolio = base > 0 ? +((p.value / base) * 100 - 100).toFixed(2) : 0
      const cdiVal = benchmarks?.cdi[p.month]
      const ipcaVal = benchmarks?.ipca[p.month]
      return {
        month: p.month,
        'Sua Carteira': portfolio,
        CDI: cdiVal === undefined ? null : +(cdiVal - 100).toFixed(2),
        IPCA: ipcaVal === undefined ? null : +(ipcaVal - 100).toFixed(2),
      }
    })
  }, [sliced, benchmarks])

  // last non-null values for summary cards
  const lastPortfolio = chartData.at(-1)?.['Sua Carteira'] ?? null
  const lastCdi = [...chartData].reverse().find((d) => d.CDI !== null)?.CDI ?? null
  const lastIpca = [...chartData].reverse().find((d) => d.IPCA !== null)?.IPCA ?? null

  if (!loading && fullHistory.length < 2) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Rentabilidade vs Benchmarks</CardTitle>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-64 rounded bg-muted animate-pulse" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Sua Carteira', value: lastPortfolio, color: COLORS.portfolio },
                { label: 'CDI', value: lastCdi, color: COLORS.cdi },
                { label: 'IPCA', value: lastIpca, color: COLORS.ipca },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  {benchLoading ? (
                    <div className="h-4 w-12 mx-auto rounded bg-muted animate-pulse" />
                  ) : (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: value === null || value < 0 ? '#ef4444' : color }}
                    >
                      {value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {benchError && (
              <p className="text-xs text-muted-foreground text-center">
                Não foi possível carregar CDI/IPCA. Verifique sua conexão.
              </p>
            )}

            <div className="relative">
              {benchLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded z-10">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="plainline"
                    iconSize={16}
                    wrapperStyle={{ fontSize: 12, paddingTop: 12, opacity: 0.6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Sua Carteira"
                    stroke={COLORS.portfolio}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="CDI"
                    stroke={COLORS.cdi}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="IPCA"
                    stroke={COLORS.ipca}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
