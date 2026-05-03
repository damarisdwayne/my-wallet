import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'
import { calcScore } from '../utils'

interface CategoryRowProps {
  cat: PortfolioCategory
  catAssets: Asset[]
  diagram: Diagram
  answers: Record<string, AssetAnswers>
  assetTargets: Map<string, number>
  manual: boolean
  draftActive: boolean
  draft: Record<string, string>
  isSaving: boolean
  onEnterManual: (catId: string, catAssets: Asset[]) => void
  onExitManual: (catId: string, catAssets: Asset[]) => void
  onUpdateDraft: (catId: string, assetId: string, value: string) => void
  onSaveManual: (catId: string, catAssets: Asset[]) => void
  onSelectAsset: (asset: Asset) => void
}

export const CategoryRow = ({
  cat,
  catAssets,
  diagram,
  answers,
  assetTargets,
  manual,
  draftActive,
  draft,
  isSaving,
  onEnterManual,
  onExitManual,
  onUpdateDraft,
  onSaveManual,
  onSelectAsset,
}: CategoryRowProps) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
        <span className="text-sm font-semibold text-foreground">{cat.name}</span>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-xs">
        <button
          onClick={() => {
            if (manual || draftActive) onExitManual(cat.id, catAssets)
          }}
          className={cn(
            'px-2.5 py-1 rounded-full transition-colors',
            !manual && !draftActive
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Diagrama
        </button>
        <button
          onClick={() => {
            if (!manual && !draftActive) onEnterManual(cat.id, catAssets)
          }}
          className={cn(
            'px-2.5 py-1 rounded-full transition-colors',
            manual || draftActive
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          % Manual
        </button>
      </div>
    </div>

    {manual || draftActive ? (
      <div className="space-y-1">
        {catAssets.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-24 shrink-0">
              <p className="text-sm font-semibold text-foreground">{a.ticker}</p>
              <p className="text-[10px] text-muted-foreground truncate">{a.name}</p>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={draft[a.id] ?? ''}
                onChange={(e) => onUpdateDraft(cat.id, a.id, e.target.value)}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onSaveManual(cat.id, catAssets)}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {isSaving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-1">
        {catAssets.map((a) => {
          const { yes, total } = calcScore(answers[a.id] ?? {}, diagram.questions)
          const pct = total > 0 ? (yes / total) * 100 : 0
          const scoreColor =
            pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-destructive'
          return (
            <button
              key={a.id}
              onClick={() => onSelectAsset(a)}
              className="w-full flex items-center gap-4 group text-left hover:bg-accent/40 rounded-md px-2 py-2 transition-colors"
            >
              <div className="w-24 shrink-0">
                <p className="text-sm font-semibold text-foreground">{a.ticker}</p>
                <p className="text-[10px] text-muted-foreground truncate">{a.name}</p>
              </div>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-bold w-12 text-right tabular-nums',
                  scoreColor,
                )}
              >
                {yes}/{total}
              </span>
              <span className="w-12 text-xs text-right text-muted-foreground shrink-0">
                alvo{' '}
                {cat.targetPercent > 0
                  ? (((assetTargets.get(a.id) ?? 0) / cat.targetPercent) * 100).toFixed(1)
                  : '0.0'}
                %
              </span>
              <ChevronRight
                size={14}
                className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          )
        })}
      </div>
    )}
  </div>
)
