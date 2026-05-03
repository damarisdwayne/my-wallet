import { useState } from 'react'
import { Clock, HelpCircle, TrendingDown, TrendingUp } from 'lucide-react'
import type { FundamentalSnapshot } from '@/types'
import type { IndicatorDef } from '../types'
import { fmtDate } from '../utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components'

export const TrendIcon = ({
  isIncrease,
  isGood,
}: {
  isIncrease: boolean
  isGood: boolean | null
}) => {
  const colorClass =
    isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'
  return isIncrease ? (
    <TrendingUp size={11} className={colorClass} />
  ) : (
    <TrendingDown size={11} className={colorClass} />
  )
}

export const HistoryDialog = ({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Histórico — {title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-1 max-h-80 overflow-y-auto">{children}</div>
    </DialogContent>
  </Dialog>
)

export const IndicatorHistoryContent = ({
  snapshots,
  def,
}: {
  snapshots: FundamentalSnapshot[]
  def: IndicatorDef
}) => {
  const entries = [...snapshots]
    .reverse()
    .filter((s) => (s[def.key] as number | null | undefined) != null)
  return (
    <>
      {entries.map((s, i) => {
        const val = s[def.key] as number
        const nextEntry = entries[i + 1]
        const prevVal = nextEntry ? (nextEntry[def.key] as number | null) : null
        const delta = prevVal !== null ? val - prevVal : null
        const isIncrease = delta !== null ? delta > 0 : null
        const isGood =
          delta === null || def.trendType === 'neutral'
            ? null
            : def.trendType === 'up-good'
              ? isIncrease!
              : !isIncrease!
        return (
          <div
            key={s.fetchedAt}
            className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
          >
            <span className="text-muted-foreground">{fmtDate(s.fetchedAt)}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{def.format(val)}</span>
              {delta !== null &&
                Math.abs(delta) > 0.0001 &&
                def.format(Math.abs(delta)) !== def.format(0) && (
                  <span
                    className={`flex items-center gap-0.5 ${isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'}`}
                  >
                    <TrendIcon isIncrease={isIncrease ?? false} isGood={isGood} />
                    {delta > 0 ? '+' : ''}
                    {def.format(delta)}
                  </span>
                )}
            </div>
          </div>
        )
      })}
    </>
  )
}

export const IndicatorCard = ({
  def,
  snapshots,
}: {
  def: IndicatorDef
  snapshots: FundamentalSnapshot[]
}) => {
  const [histOpen, setHistOpen] = useState(false)
  const current = snapshots.at(-1)
  const val = current != null ? ((current[def.key] as number | null | undefined) ?? null) : null
  if (val == null && snapshots.every((s) => (s[def.key] as number | null | undefined) == null))
    return null

  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const prevVal = prev != null ? ((prev[def.key] as number | null | undefined) ?? null) : null
  const delta = val != null && prevVal != null ? val - prevVal : null
  const isIncrease = delta !== null ? delta > 0 : null
  const isGood =
    delta === null || def.trendType === 'neutral'
      ? null
      : def.trendType === 'up-good'
        ? isIncrease!
        : !isIncrease!
  const hasHistory =
    snapshots.filter((s) => (s[def.key] as number | null | undefined) != null).length >= 1

  return (
    <TooltipProvider delayDuration={200}>
      <>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {def.label}
            </span>
            {def.tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <HelpCircle size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs space-y-1.5 p-3">
                  <p className="font-semibold text-xs">{def.tooltip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {def.tooltip.description}
                  </p>
                  {def.tooltip.ideal && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Ideal:</span>{' '}
                      {def.tooltip.ideal}
                    </p>
                  )}
                  {def.tooltip.calc && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Cálculo:</span>{' '}
                      {def.tooltip.calc}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {val !== null ? (
                <span className="text-sm font-bold text-foreground">{def.format(val)}</span>
              ) : (
                <span className="text-sm text-muted-foreground/40">—</span>
              )}
              {delta !== null &&
                Math.abs(delta) > 0.0001 &&
                def.format(Math.abs(delta)) !== def.format(0) && (
                  <span
                    className={`flex items-center gap-0.5 text-xs ${isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'}`}
                  >
                    <TrendIcon isIncrease={isIncrease ?? false} isGood={isGood} />
                    {delta > 0 ? '+' : ''}
                    {def.format(delta)}
                  </span>
                )}
            </div>
            {hasHistory && (
              <button
                onClick={() => setHistOpen(true)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
              >
                <Clock size={11} />
              </button>
            )}
          </div>
        </div>

        {hasHistory && (
          <HistoryDialog title={def.label} open={histOpen} onOpenChange={setHistOpen}>
            <IndicatorHistoryContent snapshots={snapshots} def={def} />
          </HistoryDialog>
        )}
      </>
    </TooltipProvider>
  )
}
