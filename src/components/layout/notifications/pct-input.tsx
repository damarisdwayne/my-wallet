import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface Props {
  value: number
  disabled: boolean
  onCommit: (value: number) => void
}

export const PctInput = ({ value, disabled, onCommit }: Props) => {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    const parsed = Number.parseFloat(draft ?? '')
    if (parsed > 0 && parsed !== value) onCommit(parsed)
    setDraft(null)
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Input
        type="number"
        min={1}
        max={90}
        step={1}
        value={draft ?? value}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="h-8 w-16 text-right"
      />
      <span className="text-xs text-muted-foreground">%</span>
    </div>
  )
}
