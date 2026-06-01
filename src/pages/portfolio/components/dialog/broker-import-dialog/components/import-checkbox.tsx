import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportCheckboxProps {
  checked: boolean
  onChange: () => void
  title?: string
}

// Small checkbox used to include/exclude a single operation from the import.
export const ImportCheckbox = ({ checked, onChange, title }: ImportCheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    title={title}
    onClick={onChange}
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
      checked
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-transparent hover:border-muted-foreground',
    )}
  >
    {checked && <Check size={12} strokeWidth={3} />}
  </button>
)
