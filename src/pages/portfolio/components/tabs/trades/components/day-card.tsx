import type { ReactNode } from 'react'

interface Props {
  date: string
  count: string
  summary?: ReactNode
  children: ReactNode
}

const formatDayHeader = (date: string) => {
  const label = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export const DayCard = ({ date, count, summary, children }: Props) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <div className="flex items-center gap-3 bg-muted/40 px-4 py-2">
      <span className="text-sm font-semibold text-foreground">{formatDayHeader(date)}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
      <div className="ml-auto flex items-center gap-3 text-xs tabular-nums">{summary}</div>
    </div>
    <div className="border-t border-border">{children}</div>
  </div>
)
