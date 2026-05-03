import { memo, useState } from 'react'
import {
  formatCurrency,
  formatCompact as fmtCompact,
  formatMonthYear as fmtMonth,
} from '@/lib/utils'
import type { PatrimonyPoint } from '@/services/patrimony'
import { MASK, MASK_SHORT } from '@/store/privacy'

/* ─── chart geometry ─── */
const W = 800
const H = 260
const PAD = { top: 16, right: 24, bottom: 44, left: 76 }
const CW = W - PAD.left - PAD.right
const CH = H - PAD.top - PAD.bottom
const Y_TICKS = 5

const ptX = (i: number, n: number) => PAD.left + (n <= 1 ? CW / 2 : (i / (n - 1)) * CW)
const ptY = (v: number, min: number, range: number) =>
  PAD.top + CH - ((v - min) / (range || 1)) * CH

/* ─── range options ─── */
type Range = '6M' | '1A' | 'MAX'
const RANGES: Range[] = ['6M', '1A', 'MAX']

const filterByRange = (data: PatrimonyPoint[], range: Range): PatrimonyPoint[] => {
  if (range === 'MAX') return data
  const months = range === '6M' ? 6 : 12
  return data.slice(-months)
}

/* ─── X-axis label spacing ─── */
const xLabels = (data: PatrimonyPoint[]): number[] => {
  const n = data.length
  if (n <= 1) return [0]
  if (n <= 8) return data.map((_, i) => i)
  const step = Math.ceil(n / 8)
  const idxs: number[] = []
  for (let i = 0; i < n; i += step) idxs.push(i)
  if (idxs.at(-1) !== n - 1) idxs.push(n - 1)
  return idxs
}

/* ─── component ─── */

interface Props {
  history: PatrimonyPoint[]
  currentValue: number
  currentMonth: string
  hidden?: boolean
}

export const PatrimonyChart = memo(
  ({ history, currentValue, currentMonth, hidden }: Props) => {
    const [range, setRange] = useState<Range>('MAX')
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

    const merged: PatrimonyPoint[] = (() => {
      const last = history.at(-1)
      if (last?.month === currentMonth) {
        return [...history.slice(0, -1), { month: currentMonth, value: currentValue }]
      }
      return [...history, { month: currentMonth, value: currentValue }]
    })()

    const data = filterByRange(merged, range)
    const n = data.length

    if (n === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Nenhum histórico registrado ainda.
        </div>
      )
    }

    const allValues = data.map((d) => d.value)
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const padding = (maxVal - minVal) * 0.12 || maxVal * 0.1 || 1000
    const yMin = Math.max(0, minVal - padding)
    const yMax = maxVal + padding
    const yRange = yMax - yMin

    const first = data[0].value
    const last = data[n - 1].value
    const absChange = last - first
    const pctChange = first > 0 ? ((last - first) / first) * 100 : 0
    const positive = absChange >= 0

    const pts = data.map((d, i) => ({ x: ptX(i, n), y: ptY(d.value, yMin, yRange) }))
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = linePath + ` L ${pts[n - 1].x} ${PAD.top + CH} L ${pts[0].x} ${PAD.top + CH} Z`

    const yTicks = Array.from({ length: Y_TICKS }, (_, i) => {
      const v = yMin + (i / (Y_TICKS - 1)) * yRange
      return { v, y: ptY(v, yMin, yRange) }
    })

    const xLabelIdxs = xLabels(data)
    const hov = hoveredIdx !== null ? data[hoveredIdx] : null
    const hovPt = hoveredIdx !== null ? pts[hoveredIdx] : null

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const rawX = ((e.clientX - rect.left) / rect.width) * W
      const idx = Math.round(((rawX - PAD.left) / CW) * (n - 1))
      setHoveredIdx(Math.max(0, Math.min(n - 1, idx)))
    }

    const primaryColor = 'hsl(var(--primary))'
    const successColor = 'hsl(var(--success, 142 71% 45%))'
    const destructiveColor = 'hsl(var(--destructive))'

    return (
      <div className="space-y-4">
        {/* stats + controls row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`text-xl font-bold ${positive ? 'text-success' : 'text-destructive'}`}>
              {hidden ? MASK : `${positive ? '+' : ''}${formatCurrency(absChange)}`}
            </span>
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
            >
              {positive ? '+' : ''}
              {pctChange.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">no período</span>
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

        {/* SVG chart */}
        <div className="relative w-full select-none">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: 'auto' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <linearGradient id="patrimonyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={positive ? successColor : destructiveColor}
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor={positive ? successColor : destructiveColor}
                  stopOpacity="0.02"
                />
              </linearGradient>
              <clipPath id="chartClip">
                <rect x={PAD.left} y={PAD.top} width={CW} height={CH} />
              </clipPath>
            </defs>

            {/* gridlines + y-axis labels */}
            {yTicks.map(({ v, y }) => (
              <g key={v}>
                <line
                  x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y}
                  stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
                />
                <text
                  x={PAD.left - 8} y={y}
                  textAnchor="end" dominantBaseline="middle"
                  fontSize="11" fill="currentColor" opacity="0.45"
                >
                  {hidden ? MASK_SHORT : fmtCompact(v)}
                </text>
              </g>
            ))}

            {/* area fill */}
            <path d={areaPath} fill="url(#patrimonyGrad)" clipPath="url(#chartClip)" />

            {/* patrimony line */}
            <path
              d={linePath} fill="none"
              stroke={positive ? successColor : destructiveColor}
              strokeWidth="2" strokeLinejoin="round"
              clipPath="url(#chartClip)"
            />

            {/* x-axis labels */}
            {xLabelIdxs.map((i) => (
              <text
                key={i} x={pts[i].x} y={PAD.top + CH + 20}
                textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.45"
              >
                {fmtMonth(data[i].month)}
              </text>
            ))}

            {/* dots first/last */}
            {[0, n - 1].map((i) => (
              <circle
                key={i} cx={pts[i].x} cy={pts[i].y} r="4"
                fill={positive ? successColor : destructiveColor} opacity="0.7"
              />
            ))}

            {/* hovered point */}
            {hovPt && hoveredIdx !== null && (
              <g>
                <line
                  x1={hovPt.x} y1={PAD.top} x2={hovPt.x} y2={PAD.top + CH}
                  stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3"
                />
                <circle cx={hovPt.x} cy={hovPt.y} r="5" fill={positive ? successColor : destructiveColor} />
                <circle cx={hovPt.x} cy={hovPt.y} r="9" fill={primaryColor} fillOpacity="0.15" />
              </g>
            )}
          </svg>

          {/* floating tooltip */}
          {hov && hovPt && (
            <div
              className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-3 py-2 shadow-md text-xs"
              style={{
                left: `${(hovPt.x / W) * 100}%`,
                top: `${(hovPt.y / H) * 100}%`,
                transform: hovPt.x > W * 0.7 ? 'translate(-110%, -120%)' : 'translate(8px, -120%)',
              }}
            >
              <p className="font-semibold text-foreground text-sm">
                {hidden ? MASK : formatCurrency(hov.value)}
              </p>
              <p className="text-muted-foreground mt-0.5">{fmtMonth(hov.month)}</p>
            </div>
          )}
        </div>
      </div>
    )
  },
)
