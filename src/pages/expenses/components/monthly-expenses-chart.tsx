import type { ExpenseCategory } from '@/types'
import { CATEGORY_SVG_COLORS, categoryLabel, formatMonthLabel } from '../utils'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export type MonthPoint = {
  month: string
  total: number
  byCategory: Partial<Record<ExpenseCategory, number>>
}

export const MonthlyExpensesChart = ({
  data,
  selectedMonth,
  onSelectMonth,
}: {
  data: MonthPoint[]
  selectedMonth: string
  onSelectMonth: (m: string) => void
}) => {
  const [tooltip, setTooltip] = useState<{ pct: number; point: MonthPoint } | null>(null)

  const CATEGORIES = Object.keys(CATEGORY_SVG_COLORS) as ExpenseCategory[]

  const W = 600
  const H = 220
  const PAD_L = 48
  const PAD_R = 12
  const PAD_T = 16
  const PAD_B = 36
  const CHART_W = W - PAD_L - PAD_R
  const CHART_H = H - PAD_T - PAD_B

  const niceMax = Math.ceil(Math.max(...data.map((d) => d.total), 1) / 500) * 500
  const barW = data.length > 0 ? CHART_W / data.length : 0
  const barPad = Math.max(barW * 0.15, (barW - 50) / 2)
  const bw = barW - barPad * 2
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax)

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setTooltip(null)}>
        {gridLines.map((val) => {
          const y = PAD_T + CHART_H - (val / niceMax) * CHART_H
          return (
            <g key={val}>
              <line
                x1={PAD_L}
                y1={y}
                x2={W - PAD_R}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={1}
              />
              <text
                x={PAD_L - 5}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="currentColor"
                opacity={0.4}
              >
                {val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : val}
              </text>
            </g>
          )
        })}

        {data.map((point, i) => {
          const x = PAD_L + i * barW
          const barX = x + barPad
          const isSelected = point.month === selectedMonth
          const segments = CATEGORIES.filter((c) => (point.byCategory[c] ?? 0) > 0).map((c) => ({
            cat: c,
            value: point.byCategory[c]!,
          }))
          let stackY = PAD_T + CHART_H

          return (
            <g
              key={point.month}
              className="cursor-pointer"
              onClick={() => onSelectMonth(point.month)}
              onMouseEnter={() => setTooltip({ pct: ((barX + bw / 2) / W) * 100, point })}
            >
              {isSelected && (
                <rect
                  x={x + 2}
                  y={PAD_T}
                  width={barW - 4}
                  height={CHART_H}
                  rx={3}
                  fill="currentColor"
                  opacity={0.06}
                />
              )}
              {segments.map(({ cat, value }, si) => {
                const bh = Math.max((value / niceMax) * CHART_H, 1)
                stackY -= bh
                const isTop = si === segments.length - 1
                return (
                  <rect
                    key={cat}
                    x={barX}
                    y={stackY}
                    width={bw}
                    height={bh}
                    fill={CATEGORY_SVG_COLORS[cat]}
                    opacity={isSelected ? 1 : 0.65}
                    rx={isTop ? 2 : 0}
                  />
                )
              })}
              <text
                x={barX + bw / 2}
                y={H - PAD_B + 14}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                opacity={isSelected ? 1 : 0.45}
                fontWeight={isSelected ? '600' : '400'}
              >
                {formatMonthLabel(point.month)}
              </text>
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-popover border border-border rounded-lg shadow-lg p-2.5 text-xs min-w-[150px]"
          style={{ left: `${tooltip.pct}%`, top: '0%', transform: 'translate(-50%, 0)' }}
        >
          <p className="font-semibold text-foreground mb-1.5">
            {formatMonthLabel(tooltip.point.month)}
          </p>
          {CATEGORIES.filter((c) => (tooltip.point.byCategory[c] ?? 0) > 0)
            .sort((a, b) => (tooltip.point.byCategory[b] ?? 0) - (tooltip.point.byCategory[a] ?? 0))
            .map((c) => (
              <div key={c} className="flex items-center justify-between gap-3 py-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_SVG_COLORS[c] }}
                  />
                  <span className="text-muted-foreground">{categoryLabel[c]}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(tooltip.point.byCategory[c]!)}
                </span>
              </div>
            ))}
          <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(tooltip.point.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
