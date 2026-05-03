import { memo } from 'react'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'
import { calcScore } from '../utils'

const ManualAllocationSection = ({
  catAssets,
  draft,
  draftSum,
  sumOk,
  isSaving,
  onUpdateDraft,
  onSaveManual,
}: {
  catAssets: Asset[]
  draft: Record<string, string>
  draftSum: number
  sumOk: boolean
  isSaving: boolean
  onUpdateDraft: (id: string, v: string) => void
  onSaveManual: () => void
}) => (
  <div className="space-y-3">
    {catAssets.map((a) => {
      const val = Number(draft[a.id]) || 0
      return (
        <div key={a.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{a.ticker}</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-16 rounded-md border border-input bg-background px-2 py-0.5 text-xs text-right text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={draft[a.id] ?? ''}
                onChange={(e) => onUpdateDraft(a.id, e.target.value)}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={100}
            step="0.1"
            value={val}
            className="w-full accent-primary h-1.5 cursor-pointer"
            onChange={(e) => onUpdateDraft(a.id, e.target.value)}
          />
        </div>
      )
    })}
    <div className="flex items-center justify-between pt-1">
      <span className={cn('text-xs', sumOk ? 'text-success' : 'text-warning')}>
        Soma: {draftSum.toFixed(1)}% {sumOk ? '✓' : '(meta: 100%)'}
      </span>
      <button
        onClick={onSaveManual}
        disabled={isSaving}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        {isSaving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  </div>
)

const DiagramView = ({
  diagram,
  catAssets,
  answers,
  assetTargets,
  cat,
  catValue,
  onCreateDiagram,
  onEditQuestions,
  onAnswerAsset,
}: {
  diagram: Diagram | null
  catAssets: Asset[]
  answers: Record<string, AssetAnswers>
  assetTargets: Map<string, number>
  cat: PortfolioCategory
  catValue: number
  onCreateDiagram: () => void
  onEditQuestions: () => void
  onAnswerAsset: (asset: Asset) => void
}) => {
  if (diagram) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {diagram.name} · {diagram.questions.length} perguntas
          </span>
          <button
            onClick={onEditQuestions}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil size={11} />
            Perguntas
          </button>
        </div>
        {catAssets.map((a) => (
          <DiagramAssetRow
            key={a.id}
            a={a}
            diagram={diagram}
            answers={answers}
            assetTargets={assetTargets}
            cat={cat}
            catValue={catValue}
            onAnswerAsset={onAnswerAsset}
          />
        ))}
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-muted-foreground">Nenhum diagrama configurado</span>
      <button
        onClick={onCreateDiagram}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={12} />
        Criar diagrama
      </button>
    </div>
  )
}

const DiagramAssetRow = ({
  a,
  diagram,
  answers,
  assetTargets,
  cat,
  catValue,
  onAnswerAsset,
}: {
  a: Asset
  diagram: Diagram
  answers: Record<string, AssetAnswers>
  assetTargets: Map<string, number>
  cat: PortfolioCategory
  catValue: number
  onAnswerAsset: (asset: Asset) => void
}) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const { yes, total } = calcScore(answers[a.id] ?? {}, diagram.questions)
  const scorePct = total > 0 ? (yes / total) * 100 : 0
  const scoreColor =
    scorePct >= 75 ? 'text-success' : scorePct >= 50 ? 'text-warning' : 'text-destructive'
  const withinCatRatio =
    cat.targetPercent > 0 ? (assetTargets.get(a.id) ?? 0) / cat.targetPercent : 0
  const metaValue = withinCatRatio * catValue
  const atualValue = a.currentPrice * a.quantity
  const atualPct = catValue > 0 ? ((atualValue / catValue) * 100).toFixed(1) : '0.0'
  return (
    <button
      onClick={() => onAnswerAsset(a)}
      className="w-full flex items-center gap-3 group text-left hover:bg-accent/40 rounded-md px-1 py-1.5 transition-colors"
    >
      <div className="w-20 shrink-0">
        <p className="text-sm font-semibold text-foreground">{a.ticker}</p>
      </div>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${scorePct}%` }}
        />
      </div>
      <span className={cn('shrink-0 text-xs font-bold w-10 text-right tabular-nums', scoreColor)}>
        {yes}/{total}
      </span>
      <div className="w-28 shrink-0 text-right">
        <p className="text-[10px] text-muted-foreground">
          Meta {(withinCatRatio * 100).toFixed(1)}%
        </p>
        <p className="text-xs font-medium text-foreground">{fmt(metaValue)}</p>
      </div>
      <div className="w-28 shrink-0 text-right">
        <p className="text-[10px] text-muted-foreground">Atual {atualPct}%</p>
        <p className="text-xs font-medium text-foreground">{fmt(atualValue)}</p>
      </div>
      <ChevronRight
        size={12}
        className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  )
}

interface CategoryCardProps {
  cat: PortfolioCategory
  catAssets: Asset[]
  catValue: number
  actualPct: number
  diff: number
  catTargetValue: number
  expanded: boolean
  inManualMode: boolean
  diagram: Diagram | null
  isSaving: boolean
  answers: Record<string, AssetAnswers>
  assetTargets: Map<string, number>
  confirmDeleteId: string | null
  draft: Record<string, string>
  onToggleExpand: () => void
  onEdit: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onDelete: () => void
  onExitManual: () => void
  onEnterManual: () => void
  onUpdateDraft: (assetId: string, value: string) => void
  onSaveManual: () => void
  onAnswerAsset: (asset: Asset) => void
  onEditQuestions: () => void
  onCreateDiagram: () => void
}

export const CategoryCard = memo(
  ({
    cat,
    catAssets,
    catValue,
    actualPct,
    diff,
    catTargetValue,
    expanded,
    inManualMode,
    diagram,
    isSaving,
    answers,
    assetTargets,
    confirmDeleteId,
    draft,
    onToggleExpand,
    onEdit,
    onConfirmDelete,
    onCancelDelete,
    onDelete,
    onExitManual,
    onEnterManual,
    onUpdateDraft,
    onSaveManual,
    onAnswerAsset,
    onEditQuestions,
    onCreateDiagram,
  }: CategoryCardProps) => {
    const { hideValues } = usePrivacy()
    const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

    const { tracking } = cat
    const showDiagramSection = tracking === 'diagram'
    const showModeToggle = false
    const effectiveInManual = tracking !== 'diagram'
    const showingDiagram = showDiagramSection && !effectiveInManual
    const isCollapsed = !expanded

    const draftSum = catAssets.reduce((s, a) => s + (Number(draft[a.id]) || 0), 0)
    const sumOk = Math.abs(draftSum - 100) < 0.15

    const showCardContent = catAssets.length > 0 && tracking !== 'none'

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
              <CardTitle className="text-foreground text-sm font-semibold">{cat.name}</CardTitle>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {true && (
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  Meta: {cat.targetPercent}% · {fmt(catTargetValue)}
                </span>
              )}
              <span className="hidden sm:inline text-xs font-medium text-foreground">
                Atual: {actualPct.toFixed(1)}% · {fmt(catValue)}
              </span>
              {true && (
                <Badge variant={diff >= 0 ? 'success' : 'destructive'}>
                  {diff >= 0 ? '+' : ''}
                  {diff.toFixed(1)}%
                </Badge>
              )}
              <button
                onClick={onEdit}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Pencil size={13} />
              </button>
              {confirmDeleteId === cat.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-destructive">Confirmar?</span>
                  <button
                    onClick={onDelete}
                    className="px-1.5 py-0.5 rounded text-xs bg-destructive text-destructive-foreground"
                  >
                    Sim
                  </button>
                  <button
                    onClick={onCancelDelete}
                    className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={onConfirmDelete}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
          {true && (
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${Math.min(actualPct, 100)}%`, background: cat.color }}
              />
            </div>
          )}
        </CardHeader>

        {showCardContent && (
          <CardContent className="pt-0">
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              {expanded
                ? 'Fechar ativos'
                : `Ver ${catAssets.length} ativo${catAssets.length === 1 ? '' : 's'}`}
            </button>

            {expanded && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Alvo por ativo</span>

                  {showModeToggle && (
                    <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-xs">
                      <button
                        onClick={() => {
                          if (inManualMode) onExitManual()
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-full transition-colors',
                          inManualMode
                            ? 'text-muted-foreground hover:text-foreground'
                            : 'bg-background text-foreground shadow-sm',
                        )}
                      >
                        Diagrama
                      </button>
                      <button
                        onClick={() => {
                          if (!inManualMode) onEnterManual()
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-full transition-colors',
                          inManualMode
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        % Manual
                      </button>
                    </div>
                  )}
                </div>

                {/* Diagram scoring view */}
                {showingDiagram && (
                  <DiagramView
                    diagram={diagram}
                    catAssets={catAssets}
                    answers={answers}
                    assetTargets={assetTargets}
                    cat={cat}
                    catValue={catValue}
                    onCreateDiagram={onCreateDiagram}
                    onEditQuestions={onEditQuestions}
                    onAnswerAsset={onAnswerAsset}
                  />
                )}

                {/* Manual % allocation */}
                {effectiveInManual && (
                  <ManualAllocationSection
                    catAssets={catAssets}
                    draft={draft}
                    draftSum={draftSum}
                    sumOk={sumOk}
                    isSaving={isSaving}
                    onUpdateDraft={onUpdateDraft}
                    onSaveManual={onSaveManual}
                  />
                )}
              </div>
            )}

            {isCollapsed && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {catAssets.map((a) => {
                  const withinCatRatio =
                    cat.targetPercent > 0 ? (assetTargets.get(a.id) ?? 0) / cat.targetPercent : 0
                  const metaPct = (withinCatRatio * 100).toFixed(1)
                  const metaValue = withinCatRatio * catValue
                  const atualValue = a.currentPrice * a.quantity
                  const atualPct = catValue > 0 ? ((atualValue / catValue) * 100).toFixed(1) : '0.0'
                  return (
                    <div key={a.id} className="text-xs p-2 rounded bg-muted space-y-0.5">
                      <p className="font-semibold text-foreground">{a.ticker}</p>
                      {true && (
                        <p className="text-muted-foreground">
                          Meta {metaPct}% · {fmt(metaValue)}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        Atual {atualPct}% · {fmt(atualValue)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  },
)
