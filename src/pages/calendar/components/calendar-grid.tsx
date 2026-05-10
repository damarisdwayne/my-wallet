import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UpcomingDividend } from '@/services/statusinvest'
import type { ReportEvent } from '../utils/report-events'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

type Props = {
  year: number
  month: number
  dividends: UpcomingDividend[]
  reports: ReportEvent[]
  selectedDay: string | null
  onSelectDay: (day: string | null) => void
  onPrev: () => void
  onNext: () => void
}

const buildCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: string; current: boolean }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const m = month === 0 ? 12 : month
    const y = month === 0 ? year - 1 : year
    cells.push({
      date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      current: false,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '00')}`,
      current: true,
    })
  }

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2
    const y = month === 11 ? year + 1 : year
    cells.push({
      date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      current: false,
    })
  }

  return cells
}

export const CalendarGrid = ({
  year,
  month,
  dividends,
  reports,
  selectedDay,
  onSelectDay,
  onPrev,
  onNext,
}: Props) => {
  const today = new Date().toISOString().slice(0, 10)
  const cells = buildCalendarDays(year, month)

  const dividendsByDay = new Map<string, UpcomingDividend[]>()
  for (const d of dividends) {
    if (!d.paymentDate) continue
    const list = dividendsByDay.get(d.paymentDate) ?? []
    list.push(d)
    dividendsByDay.set(d.paymentDate, list)
  }

  const reportsByDay = new Map<string, ReportEvent[]>()
  for (const r of reports) {
    const list = reportsByDay.get(r.date) ?? []
    list.push(r)
    reportsByDay.set(r.date, list)
  }

  return (
    <div className="space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={onNext}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide pb-1"
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((cell) => {
          const divs = dividendsByDay.get(cell.date) ?? []
          const reps = reportsByDay.get(cell.date) ?? []
          const isToday = cell.date === today
          const isSelected = cell.date === selectedDay
          const hasAny = divs.length > 0 || reps.length > 0

          return (
            <button
              key={cell.date}
              onClick={() => onSelectDay(isSelected ? null : cell.date)}
              className={cn(
                'relative flex flex-col items-center justify-start rounded-lg pt-1.5 pb-2 px-0.5 min-h-13 transition-colors text-xs',
                cell.current ? 'text-foreground hover:bg-accent' : 'text-muted-foreground/40',
                isSelected && 'bg-primary/10 ring-1 ring-primary',
                !isSelected && isToday && 'bg-accent',
              )}
            >
              <span
                className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium leading-none',
                  isToday && !isSelected && 'text-primary font-semibold',
                  isSelected && 'bg-primary text-primary-foreground',
                )}
              >
                {Number(cell.date.slice(8))}
              </span>

              {hasAny && cell.current && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-1 px-0.5">
                  {divs.slice(0, 2).map((d) => (
                    <span
                      key={d.ticker + d.paymentDate}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                  {reps.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  {divs.length + reps.length > 3 && (
                    <span className="text-[9px] text-muted-foreground leading-none">
                      +{divs.length + reps.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
