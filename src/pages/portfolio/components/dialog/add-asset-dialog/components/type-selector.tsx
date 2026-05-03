import { typeLabel } from '../../../../constants'
import { TYPE_GROUPS } from '../constants'
import type { AssetType } from '@/types'

export const TypeSelector = ({ onSelect }: { onSelect: (t: AssetType) => void }) => (
  <div className="space-y-4 mt-2">
    {TYPE_GROUPS.map((group) => (
      <div key={group.label}>
        <p className="text-xs text-muted-foreground mb-2">{group.label}</p>
        <div className="grid grid-cols-4 gap-2">
          {group.types.map((t) => (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className="py-2 px-1 rounded-md border border-border text-xs font-medium text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-muted/40 transition-colors text-center"
            >
              {typeLabel[t]}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
)
