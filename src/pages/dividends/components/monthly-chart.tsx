import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import {
  CH,
  CW,
  CURRENT_MONTH,
  EXT_COLOR,
  FII_COLOR,
  FIXED_COLOR,
  H,
  PAD,
  STOCK_COLOR,
  W,
  Y_TICKS,
} from '../constants'
import { fmtCompact, fmtMonth } from '../utils'
import type { MonthBreakdown } from '../utils'

type Props = {
  byMonth: Record<string, MonthBreakdown>
  avg12: number
}

export const MonthlyChart = ({ byMonth, avg12 }: Props) => {
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

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovIdx(null)}
      >
        {yTicks.map(({ v, y }, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + CW}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.07"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.45"
            >
              {fmtCompact(v)}
            </text>
          </g>
        ))}

        {avg12 > 0 && (
          <g>
            <line
              x1={PAD.left}
              y1={avgY}
              x2={PAD.left + CW}
              y2={avgY}
              stroke="hsl(var(--primary))"
              strokeOpacity="0.5"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x={PAD.left + CW + 4}
              y={avgY}
              dominantBaseline="middle"
              fontSize="10"
              fill="hsl(var(--primary))"
              opacity="0.7"
            >
              méd
            </text>
          </g>
        )}

        {entries.map(([key, b], i) => {
          const barLeft = PAD.left + i * barSpacing + (barSpacing - barW) / 2
          const isHov = hovIdx === i
          const isCurrent = key === CURRENT_MONTH

          const segments: { v: number; color: string }[] = [
            { v: b.fii, color: FII_COLOR },
            { v: b.stock, color: STOCK_COLOR },
            { v: b.fixed, color: FIXED_COLOR },
            { v: b.ext, color: EXT_COLOR },
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
                  x={barLeft - 3}
                  y={PAD.top}
                  width={barW + 6}
                  height={CH}
                  fill="currentColor"
                  fillOpacity="0.06"
                  rx="3"
                />
              )}
              {rects.map((r, ri) => (
                <rect
                  key={ri}
                  x={barLeft}
                  y={r.y}
                  width={barW}
                  height={r.h}
                  fill={r.color}
                  fillOpacity={isHov ? 1 : 0.72}
                  rx={r.isTop ? 2 : 0}
                />
              ))}
              {isCurrent && (
                <rect
                  x={barLeft}
                  y={PAD.top + CH + 6}
                  width={barW}
                  height={3}
                  fill="hsl(var(--primary))"
                  rx="1.5"
                />
              )}
              <text
                x={barLeft + barW / 2}
                y={PAD.top + CH + 20}
                textAnchor="middle"
                fontSize="11"
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

      {hovIdx !== null &&
        (() => {
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
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: STOCK_COLOR }}
                  />
                  <span className="text-muted-foreground">Ações</span>
                  <span className="ml-auto font-medium">{formatCurrency(b.stock)}</span>
                </p>
              )}
              {b.fixed > 0 && (
                <p className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: FIXED_COLOR }}
                  />
                  <span className="text-muted-foreground">Renda Fixa</span>
                  <span className="ml-auto font-medium">{formatCurrency(b.fixed)}</span>
                </p>
              )}
              {b.ext > 0 && (
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: EXT_COLOR }} />
                  <span className="text-muted-foreground">Exterior</span>
                  <span className="ml-auto font-medium">{formatCurrency(b.ext)}</span>
                </p>
              )}
              <p className="flex items-center gap-2 border-t border-border pt-1 mt-1">
                <span className="text-muted-foreground">Total</span>
                <span className="ml-auto font-bold text-success">{formatCurrency(b.total)}</span>
              </p>
            </div>
          )
        })()}

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
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: EXT_COLOR }} />
          Exterior
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span
            className="w-5 border-t-2 border-dashed"
            style={{ borderColor: 'hsl(var(--primary))' }}
          />
          Média
        </span>
      </div>
    </div>
  )
}
