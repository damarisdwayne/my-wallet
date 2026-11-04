import { memo, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { DailyPatrimonyPoint } from '@/services/patrimony'
import { MASK } from '@/store/privacy'
import { DailyTooltip } from './daily-tooltip'
import { DAILY_RANGES, buildDailySeries, formatDay, type DailyRange } from './utils'

interface Props {
  points: DailyPatrimonyPoint[]
  hidden?: boolean
}

const POSITIVE = 'hsl(142 71% 45%)'
const NEGATIVE = 'hsl(0 84% 60%)'
const AXIS_TICK = { fontSize: 11, fill: 'currentColor', opacity: 0.45 }

export const DailyChart = memo(({ points, hidden }: Props) => {
  const [range, setRange] = useState<DailyRange>('3M')
  const data = useMemo(() => buildDailySeries(points, range), [points, range])
  const last = data.at(-1)

  if (!last || data.length < 2) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
        <p>O histórico diário começa a ser registrado a partir de hoje.</p>
        <p className="text-xs">Cada dia que você abrir o app vira um ponto no gráfico.</p>
      </div>
    )
  }

  const color = last.returnPct >= 0 ? POSITIVE : NEGATIVE

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums" style={{ color }}>
              {formatPercent(last.returnPct)}
            </span>
            <span className="text-xs text-muted-foreground">no período, sem aportes</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Hoje:{' '}
            <span className={last.dayChange >= 0 ? 'text-success' : 'text-destructive'}>
              {hidden ? MASK : formatCurrency(last.dayChange)} ({formatPercent(last.dayChangePct)})
            </span>
          </p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as DailyRange)}>
          <TabsList>
            {DAILY_RANGES.map((r) => (
              <TabsTrigger key={r} value={r}>
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={['auto', 'auto']}
          />
          <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.25} />
          <Tooltip content={<DailyTooltip hidden={hidden} />} />
          <Line
            type="monotone"
            dataKey="returnPct"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})
