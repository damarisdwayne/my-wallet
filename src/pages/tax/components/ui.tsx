import { formatCurrency } from '@/lib/utils'
import { assetTypeLabel } from '../constants'

export const Section = ({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  badge?: React.ReactNode
}) => (
  <div className="rounded-lg border border-border bg-card">
    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
      <div>
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {badge}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

export const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th
    className={`py-2 px-3 text-xs font-medium text-muted-foreground border-b border-border ${right ? 'text-right' : 'text-left'}`}
  >
    {children}
  </th>
)

export const Td = ({
  children,
  right,
  className = '',
  colSpan,
}: {
  children?: React.ReactNode
  right?: boolean
  className?: string
  colSpan?: number
}) => (
  <td
    colSpan={colSpan}
    className={`py-2.5 px-3 text-sm ${right ? 'text-right' : 'text-left'} ${className}`}
  >
    {children}
  </td>
)

export const EmptyRow = ({ cols, message }: { cols: number; message: string }) => (
  <tr>
    <td colSpan={cols} className="py-8 text-center text-sm text-muted-foreground">
      {message}
    </td>
  </tr>
)

export const AmountBadge = ({
  label,
  value,
  variant = 'default',
}: {
  label: string
  value: number
  variant?: 'default' | 'success' | 'destructive' | 'warning'
}) => {
  const colors = {
    default: 'bg-muted text-foreground',
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  }
  return (
    <div className={`rounded-md px-3 py-1.5 text-right ${colors[variant]}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{formatCurrency(value)}</p>
    </div>
  )
}

export const TypeFilterChips = ({
  types,
  active,
  onChange,
}: {
  types: string[]
  active: string | null
  onChange: (t: string | null) => void
}) => (
  <div className="flex flex-wrap gap-1.5 mb-4">
    <button
      onClick={() => onChange(null)}
      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${active === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
    >
      Todos
    </button>
    {types.map((t) => (
      <button
        key={t}
        onClick={() => onChange(active === t ? null : t)}
        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${active === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
      >
        {assetTypeLabel[t] ?? t}
      </button>
    ))}
  </div>
)
