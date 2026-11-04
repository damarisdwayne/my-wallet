import { CalendarDays, Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ALL } from '../../../../constants'
import { formatMonth, formatMonthName, groupMonthsByYear } from '../utils'

interface Props {
  month: string | typeof ALL
  months: string[]
  onChange: (month: string | typeof ALL) => void
  allLabel?: string
}

const PickerItem = ({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) => (
  <DropdownMenuItem onClick={onSelect} className="justify-between gap-6">
    {label}
    {selected && <Check size={12} className="text-primary" />}
  </DropdownMenuItem>
)

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
    <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto scrollbar-none">
      <PickerItem label={allLabel} selected={month === ALL} onSelect={() => onChange(ALL)} />
      {groupMonthsByYear(months).map(({ year, months: yearMonths }) => (
        <div key={year}>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{year}</DropdownMenuLabel>
          {yearMonths.map((m) => (
            <PickerItem
              key={m}
              label={formatMonthName(m)}
              selected={month === m}
              onSelect={() => onChange(m)}
            />
          ))}
        </div>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)
