import { memo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
  formatCurrency,
  formatCompact as fmtCompact,
  formatMonthYear as fmtMonth,
} from '@/lib/utils'
import type { PatrimonyPoint } from '@/services/patrimony'
import { MASK, MASK_SHORT } from '@/store/privacy'

type Range = '6M' | '1A' | 'MAX'
const RANGES: Range[] = ['6M', '1A', 'MAX']

const filterByRange = (data: PatrimonyPoint[], range: Range): PatrimonyPoint[] => {
  if (range === 'MAX') return data
  return data.slice(range === '6M' ? -6 : -12)
}

const CustomTooltip = ({ active, payload, hidden }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as PatrimonyPoint
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground text-sm">
        {hidden ? MASK : formatCurrency(d.value)}
      </p>
      <p className="text-muted-foreground mt-0.5">{fmtMonth(d.month)}</p>
    </div>
  )
}

interface Props {
  history: PatrimonyPoint[]
  currentValue: number
  currentMonth: string
  hidden?: boolean
}

export const PatrimonyChart = memo(({ history, currentValue, currentMonth, hidden }: Props) => {
  const [range, setRange] = useState<Range>('MAX')

  const merged: PatrimonyPoint[] = (() => {
    const last = history.at(-1)
    if (last?.month === currentMonth)
      return [...history.slice(0, -1), { month: currentMonth, value: currentValue }]
    return [...history, { month: currentMonth, value: currentValue }]
  })()

  const data = filterByRange(merged, range)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Nenhum histórico registrado ainda.
      </div>
    )
  }

  const lineColor = 'hsl(142 71% 45%)'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">
            {hidden ? MASK : formatCurrency(currentValue)}
          </span>
          <span className="text-xs text-muted-foreground">patrimônio atual</span>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.9} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={fmtMonth}
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => (hidden ? MASK_SHORT : fmtCompact(v))}
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip hidden={hidden} />} cursor={{ opacity: 0.06 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})
