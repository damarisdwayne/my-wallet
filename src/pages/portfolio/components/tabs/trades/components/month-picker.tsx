import { CalendarDays, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ALL } from '../../../../constants'
import { formatMonth } from '../utils'

interface Props {
  month: string | typeof ALL
  months: string[]
  onChange: (month: string | typeof ALL) => void
  allLabel?: string
}

export const MonthPicker = ({ month, months, onChange, allLabel = 'Todo o período' }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
          month === ALL
            ? 'border-border text-muted-foreground hover:text-foreground'
            : 'border-primary/40 bg-primary/10 text-primary',
        )}
      >
        <CalendarDays size={12} />
        {month === ALL ? allLabel : formatMonth(month)}
        <ChevronDown size={12} />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
      <DropdownMenuItem onClick={() => onChange(ALL)}>{allLabel}</DropdownMenuItem>
      {months.map((m) => (
        <DropdownMenuItem key={m} onClick={() => onChange(m)}>
          {formatMonth(m)}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)
