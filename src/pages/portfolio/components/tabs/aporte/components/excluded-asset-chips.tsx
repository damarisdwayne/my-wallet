import { X } from 'lucide-react'
import type { Asset } from '@/types'

interface Props {
  assets: Asset[]
  onInclude: (id: string) => void
}

export const ExcludedAssetChips = ({ assets, onInclude }: Props) => {
  if (assets.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Fora deste aporte:</span>
      {assets.map((asset) => (
        <button
          key={asset.id}
          onClick={() => onInclude(asset.id)}
          title="Incluir de volta"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          <span className="line-through">{asset.ticker}</span>
          <X size={12} />
        </button>
      ))}
    </div>
  )
}
