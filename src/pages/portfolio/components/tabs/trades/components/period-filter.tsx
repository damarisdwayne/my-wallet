import { cn } from '@/lib/utils'
import { ALL } from '../../../../constants'
import type { TradeTypeFilter } from '../utils'
import { MonthPicker } from './month-picker'

const TYPES: { value: TradeTypeFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'buy', label: 'Compras' },
  { value: 'sell', label: 'Vendas' },
]

interface Props {
  month: string | typeof ALL
  months: string[]
  onMonthChange: (month: string | typeof ALL) => void
  type: TradeTypeFilter
  onTypeChange: (type: TradeTypeFilter) => void
}

export const PeriodFilter = ({ month, months, onMonthChange, type, onTypeChange }: Props) => (
  <div className="flex flex-wrap items-center gap-2">
    <MonthPicker month={month} months={months} onChange={onMonthChange} />

    {TYPES.map(({ value, label }) => (
      <button
        key={value}
        onClick={() => onTypeChange(value)}
        className={cn(
          'px-3 py-1 rounded-full text-xs font-medium transition-colors',
          type === value
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {label}
      </button>
    ))}
  </div>
)
