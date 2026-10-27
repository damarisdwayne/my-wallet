import { Switch } from '@/components/ui/switch'
import { PctInput } from './pct-input'

interface Props {
  label: string
  description: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  pct?: number
  onPctChange?: (pct: number) => void
}

export const AutoAlertRow = ({
  label,
  description,
  enabled,
  onToggle,
  pct,
  onPctChange,
}: Props) => (
  <div className="flex items-center gap-3 py-2">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
    {pct !== undefined && onPctChange && (
      <PctInput value={pct} disabled={!enabled} onCommit={onPctChange} />
    )}
    <Switch checked={enabled} onCheckedChange={onToggle} />
  </div>
)
