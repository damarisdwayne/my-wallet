import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

export interface SectorSlice {
  sector: string
  color: string
  value: number
  pct: number
}

interface Props {
  title: string
  slices: SectorSlice[]
  othersHint?: string
}

const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const slicePath = (cx: number, cy: number, R: number, ri: number, start: number, end: number) => {
  if (end - start >= 360) end = 359.999
  const s = polarToCartesian(cx, cy, R, start)
  const e = polarToCartesian(cx, cy, R, end)
  const si = polarToCartesian(cx, cy, ri, start)
  const ei = polarToCartesian(cx, cy, ri, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${ri} ${ri} 0 ${large} 0 ${si.x} ${si.y} Z`
}

export const SectorBreakdown = ({ title, slices, othersHint }: Props) => {
  const { hideValues } = usePrivacy()
  const [hovered, setHovered] = useState<string | null>(null)

  if (slices.length === 0) return null

  const cx = 80
  const cy = 80
  const R = 70
  const ri = 42
  const paths = slices.map((s, i) => {
    const start = slices.slice(0, i).reduce((sum, p) => sum + (p.pct / 100) * 360, 0)
    const end = start + (s.pct / 100) * 360
    return { ...s, path: slicePath(cx, cy, R, ri, start, end) }
  })

  const active = hovered ? slices.find((s) => s.sector === hovered) : null

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="flex gap-6 items-start">
        <div className="relative shrink-0">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {paths.map(({ sector, color, path }) => (
              <path
                key={sector}
                d={path}
                fill={color}
                opacity={hovered && hovered !== sector ? 0.3 : 1}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHovered(sector)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize={11}
              className="fill-foreground font-semibold"
            >
              {active ? `${active.pct.toFixed(1)}%` : `${slices.length}`}
            </text>
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {active ? active.sector : 'setores'}
            </text>
          </svg>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          {slices.map((s) => (
            <div
              key={s.sector}
              className={`flex items-center gap-2 cursor-default transition-opacity ${hovered && hovered !== s.sector ? 'opacity-30' : ''}`}
              onMouseEnter={() => setHovered(s.sector)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-foreground flex-1 truncate">{s.sector}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {s.pct.toFixed(1)}%
              </span>
              <span className="text-xs font-medium text-foreground tabular-nums min-w-20 text-right">
                {hideValues ? MASK : formatCurrency(s.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {othersHint && <p className="text-xs text-muted-foreground">{othersHint}</p>}
    </div>
  )
}
