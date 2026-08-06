import { cn } from '@/lib/utils'

interface Props<T extends string> {
  options: { value: T; label: string }[]
  selected: T
  onSelect: (value: T) => void
}

export const ChipRow = <T extends string>({ options, selected, onSelect }: Props<T>) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onSelect(o.value)}
        className={cn(
          'px-3 py-1 rounded-full text-xs font-medium transition-colors',
          selected === o.value
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
)
