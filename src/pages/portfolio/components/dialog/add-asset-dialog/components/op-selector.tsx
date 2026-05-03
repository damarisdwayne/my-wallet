import { OP_MODES } from '../constants'
import type { OpMode } from '../constants'

export const OpSelector = ({ onSelect }: { onSelect: (op: OpMode) => void }) => (
  <div className="grid grid-cols-2 gap-2 mt-3">
    {OP_MODES.map((op) => (
      <button
        key={op.value}
        onClick={() => onSelect(op.value)}
        className="py-3 px-3 rounded-md border border-border text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
      >
        <p className="text-sm font-medium text-foreground">{op.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{op.desc}</p>
      </button>
    ))}
  </div>
)
