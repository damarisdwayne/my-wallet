import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { WatchlistAsset, WatchlistVerdict } from '@/types'

const VERDICTS: { value: WatchlistVerdict; label: string; color: string }[] = [
  { value: 'buy', label: 'Comprar', color: 'bg-success/15 text-success border-success/30' },
  { value: 'watch', label: 'Observar', color: 'bg-warning/15 text-warning border-warning/30' },
  { value: 'pass', label: 'Passar', color: 'bg-destructive/15 text-destructive border-destructive/30' },
  { value: 'none', label: 'Sem veredito', color: 'bg-muted text-muted-foreground border-border' },
]

interface Props {
  asset: WatchlistAsset
  onVerdictChange: (verdict: WatchlistVerdict) => void
  onNotesChange: (notes: string) => void
  onDelete: () => void
}

export const WatchlistAssetCard = ({ asset, onVerdictChange, onNotesChange, onDelete }: Props) => {
  const [notesValue, setNotesValue] = useState(asset.notes)
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleNotesChange = (val: string) => {
    setNotesValue(val)
    if (saveTimeout) clearTimeout(saveTimeout)
    setSaveTimeout(setTimeout(() => onNotesChange(val), 600))
  }

  const currentVerdict = VERDICTS.find((v) => v.value === asset.verdict) ?? VERDICTS[3]

  return (
    <div className="border border-border rounded-lg p-3 space-y-2.5 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{asset.ticker}</p>
          <p className="text-xs text-muted-foreground truncate max-w-36">{asset.name}</p>
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {VERDICTS.filter((v) => v.value !== 'none').map((v) => (
          <button
            key={v.value}
            onClick={() => onVerdictChange(asset.verdict === v.value ? 'none' : v.value)}
            className={`px-2 py-0.5 rounded border text-xs font-medium transition-colors ${
              asset.verdict === v.value ? v.color : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <textarea
        className="w-full min-h-[72px] resize-y rounded-md border border-input bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Notas: P/VP, DY, vacância, gestão..."
        value={notesValue}
        onChange={(e) => handleNotesChange(e.target.value)}
      />

      {asset.verdict !== 'none' && (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${currentVerdict.color}`}>
          {currentVerdict.label}
        </div>
      )}
    </div>
  )
}
