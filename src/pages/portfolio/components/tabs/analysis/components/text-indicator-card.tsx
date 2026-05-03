import { useState } from 'react'
import { Clock, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components'
import type { FundamentalSnapshot } from '@/types'
import type { FiiTextDef } from '../types'
import { fmtDate } from '../utils'
import { HistoryDialog } from './indicator-card'

export const TextIndicatorCard = ({
  def,
  snapshots,
}: {
  def: FiiTextDef
  snapshots: FundamentalSnapshot[]
}) => {
  const [histOpen, setHistOpen] = useState(false)
  const entries = [...snapshots]
    .reverse()
    .filter(
      (s) => (s[def.key] as string | null | undefined) != null && (s[def.key] as string) !== '',
    )

  const current = entries[0]
  const val = current ? (current[def.key] as string) : null
  if (!val && entries.length === 0) return null

  const hasHistory = entries.length >= 1

  return (
    <TooltipProvider delayDuration={200}>
      <>
        <div className="rounded-lg border border-border p-3 col-span-2 sm:col-span-1">
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
          <div className="flex items-start justify-between gap-1.5">
            {val ? (
              <p className="text-sm font-medium text-foreground leading-snug">{val}</p>
            ) : (
              <span className="text-sm text-muted-foreground/40">—</span>
            )}
            {hasHistory && (
              <button
                onClick={() => setHistOpen(true)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
              >
                <Clock size={11} />
              </button>
            )}
          </div>
        </div>

        {hasHistory && (
          <HistoryDialog title={def.label} open={histOpen} onOpenChange={setHistOpen}>
            {entries.map((s) => (
              <div
                key={s.fetchedAt}
                className="text-xs py-1.5 border-b border-border last:border-0"
              >
                <span className="text-muted-foreground block mb-0.5">{fmtDate(s.fetchedAt)}</span>
                <span className="text-foreground">{s[def.key] as string}</span>
              </div>
            ))}
          </HistoryDialog>
        )}
      </>
    </TooltipProvider>
  )
}
