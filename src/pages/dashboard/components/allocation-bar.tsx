import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import type { AllocationSlice } from '@/hooks/use-dashboard'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import { BarChart2 } from 'lucide-react'
import { useState } from 'react'

type AllocationBarProps = {
  allocation: AllocationSlice[]
  loading: boolean
}

export const AllocationBar = ({ allocation, loading }: AllocationBarProps) => {
  const [hovered, setHovered] = useState<AllocationSlice | null>(null)
  const { hideValues } = usePrivacy()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full rounded-full bg-muted animate-pulse" />
          <div className="flex gap-4 mt-3 flex-wrap">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="h-3 w-20 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (allocation.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alocação por classe</CardTitle>
          <BarChart2 size={16} className="text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* stacked bar */}
        <div className="relative">
          <div
            className="flex h-4 rounded-full overflow-hidden gap-px"
            onMouseLeave={() => setHovered(null)}
          >
            {allocation.map((s) => (
              <div
                key={s.type}
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                className="transition-opacity"
                onMouseEnter={() => setHovered(s)}
              />
            ))}
          </div>
          {hovered && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-popover border border-border rounded-lg shadow-lg px-3 py-1.5 text-xs pointer-events-none z-10 whitespace-nowrap flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: hovered.color }}
              />
              <span className="font-medium text-foreground">{hovered.label}</span>
              <span className="text-muted-foreground">{hovered.pct.toFixed(1)}%</span>
              <span className="font-semibold text-foreground">
                {hideValues ? MASK : formatCurrency(hovered.value)}
              </span>
            </div>
          )}
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {allocation.map((s) => (
            <div key={s.type} className="flex items-center gap-2 min-w-[120px]">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-xs font-medium ml-auto">{s.pct.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">
                {hideValues ? MASK : formatCurrency(s.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
