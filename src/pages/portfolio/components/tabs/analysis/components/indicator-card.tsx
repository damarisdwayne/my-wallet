import { useState } from 'react'
import { Clock, HelpCircle, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import type { FundamentalSnapshot } from '@/types'
import type { IndicatorDef, Rating } from '../types'
import { fmtDate, ratingTextColor, ratingLabel } from '../utils'
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

// Colored dot + label summarizing the absolute quality of the current value.
const RatingLine = ({ rating }: { rating: Rating }) => {
  const dot =
    rating === 'good' ? 'bg-success' : rating === 'ok' ? 'bg-yellow-600' : 'bg-destructive'
  return (
    <p className="flex items-center gap-1.5 text-xs">
      <span className={`size-1.5 rounded-full ${dot}`} />
      <span className="font-medium text-foreground">Avaliação:</span>
      <span className={ratingTextColor[rating]}>{ratingLabel[rating]}</span>
    </p>
  )
}

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
  onDeleteSnapshot,
}: {
  snapshots: FundamentalSnapshot[]
  def: IndicatorDef
  onDeleteSnapshot?: (fetchedAt: string) => Promise<void>
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
            className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0 group"
          >
            <span className="text-muted-foreground">{fmtDate(s.fetchedAt)}</span>
            <div className="flex items-center gap-2">
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
              {onDeleteSnapshot && (
                <button
                  onClick={() => onDeleteSnapshot(s.fetchedAt)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all"
                >
                  <Trash2 size={11} />
                </button>
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
  onDeleteSnapshot,
}: {
  def: IndicatorDef
  snapshots: FundamentalSnapshot[]
  onDeleteSnapshot?: (fetchedAt: string) => Promise<void>
}) => {
  const [histOpen, setHistOpen] = useState(false)
  const withValue = [...snapshots]
    .reverse()
    .filter((s) => (s[def.key] as number | null | undefined) != null)
  const val = withValue.length > 0 ? (withValue[0][def.key] as number) : null
  if (val == null && withValue.length === 0) return null

  const rating = val != null && def.rating ? def.rating(val) : null
  const prevVal = withValue.length >= 2 ? (withValue[1][def.key] as number | null) : null
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
                  {rating && <RatingLine rating={rating} />}
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
                <span
                  className={`text-sm font-bold ${rating ? ratingTextColor[rating] : 'text-foreground'}`}
                >
                  {def.format(val)}
                </span>
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
            <IndicatorHistoryContent
              snapshots={snapshots}
              def={def}
              onDeleteSnapshot={onDeleteSnapshot}
            />
          </HistoryDialog>
        )}
      </>
    </TooltipProvider>
  )
}
