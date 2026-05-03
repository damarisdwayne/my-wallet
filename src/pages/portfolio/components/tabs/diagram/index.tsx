import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil } from 'lucide-react'
import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'
import { computeAssetTargets } from '../../../compute-targets'
import { calcScore } from './utils'
import { AssetAnswersDialog, CategoryRow, DiagramSelector, EditQuestionsDialog } from './components'

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  saveDiagram: (diagram: Diagram) => Promise<void>
  saveAnswers: (assetId: string, answers: AssetAnswers) => Promise<void>
  editAsset: (assetId: string, data: Partial<Asset>) => Promise<void>
}

export const DiagramTab = ({
  assets,
  categories,
  diagrams,
  answers,
  saveDiagram,
  saveAnswers,
  editAsset,
}: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [selectedDiagramId, setSelectedDiagramId] = useState('')
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editQuestionsOpen, setEditQuestionsOpen] = useState(false)
  const [manualDrafts, setManualDrafts] = useState<Record<string, Record<string, string>>>({})
  const [savingManual, setSavingManual] = useState<string | null>(null)

  const visibleDiagrams = diagrams.filter((d) => d.appliesTo?.some((t) => t !== 'fixed_income'))
  const activeDiagramId = selectedDiagramId || visibleDiagrams[0]?.id || ''
  const diagram = visibleDiagrams.find((d) => d.id === activeDiagramId) ?? visibleDiagrams[0]

  if (!diagram) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhum diagrama configurado ainda.
      </p>
    )
  }

  const diagramAssets = assets.filter(
    (a) => diagram.appliesTo?.includes(a.type) && a.type !== 'fixed_income',
  )

  const diagramCategories = categories.filter((cat) =>
    diagramAssets.some((a) => a.categoryId === cat.id),
  )

  const isManualCat = (catId: string) =>
    assets.filter((a) => a.categoryId === catId).some((a) => (a.targetPercent ?? 0) > 0)

  const getDraft = (catId: string, catAssets: Asset[]) => {
    if (manualDrafts[catId]) return manualDrafts[catId]
    return Object.fromEntries(
      catAssets.map((a) => [a.id, String(a.targetPercent > 0 ? a.targetPercent : '')]),
    )
  }

  const enterManual = (catId: string, catAssets: Asset[]) => {
    const cat = categories.find((c) => c.id === catId)
    const share = cat ? (cat.targetPercent / catAssets.length).toFixed(1) : '0'
    const draft = Object.fromEntries(
      catAssets.map((a) => [a.id, a.targetPercent > 0 ? String(a.targetPercent) : share]),
    )
    setManualDrafts((prev) => ({ ...prev, [catId]: draft }))
  }

  const exitManual = async (catId: string, catAssets: Asset[]) => {
    setSavingManual(catId)
    await Promise.all(catAssets.map((a) => editAsset(a.id, { targetPercent: 0 })))
    setManualDrafts((prev) => {
      const next = { ...prev }
      delete next[catId]
      return next
    })
    setSavingManual(null)
  }

  const updateDraft = (catId: string, assetId: string, value: string) => {
    setManualDrafts((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [assetId]: value },
    }))
  }

  const saveManual = async (catId: string, catAssets: Asset[]) => {
    const draft = manualDrafts[catId] ?? {}
    setSavingManual(catId)
    await Promise.all(
      catAssets.map((a) => editAsset(a.id, { targetPercent: Number(draft[a.id] ?? 0) || 0 })),
    )
    setSavingManual(null)
  }

  const editingAnswers = (editingAsset && answers[editingAsset.id]) || {}
  const { yes: editYes, total: editTotal } = calcScore(editingAnswers, diagram.questions)

  const setAnswer = async (questionId: string, value: 0 | 1) => {
    if (!editingAsset) return
    const updated = { ...(answers[editingAsset.id] ?? {}), [questionId]: value }
    await saveAnswers(editingAsset.id, updated)
  }

  return (
    <div className="space-y-5">
      <DiagramSelector
        diagrams={diagrams}
        activeDiagramId={activeDiagramId}
        onSelect={setSelectedDiagramId}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-sm font-semibold">
                {diagram.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {diagram.questions.length} perguntas
              </p>
            </div>
            <button
              onClick={() => setEditQuestionsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil size={12} />
              Editar perguntas
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {diagramCategories.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              Nenhum ativo desta categoria na carteira.
            </p>
          )}
          {diagramCategories.map((cat) => {
            const catAssets = diagramAssets.filter((a) => a.categoryId === cat.id)
            return (
              <CategoryRow
                key={cat.id}
                cat={cat}
                catAssets={catAssets}
                diagram={diagram}
                answers={answers}
                assetTargets={assetTargets}
                manual={isManualCat(cat.id)}
                draftActive={!!manualDrafts[cat.id]}
                draft={getDraft(cat.id, catAssets)}
                isSaving={savingManual === cat.id}
                onEnterManual={enterManual}
                onExitManual={exitManual}
                onUpdateDraft={updateDraft}
                onSaveManual={saveManual}
                onSelectAsset={setEditingAsset}
              />
            )
          })}
        </CardContent>
      </Card>

      <AssetAnswersDialog
        editingAsset={editingAsset}
        diagram={diagram}
        editingAnswers={editingAnswers}
        editYes={editYes}
        editTotal={editTotal}
        onClose={() => setEditingAsset(null)}
        onSetAnswer={setAnswer}
      />

      <EditQuestionsDialog
        open={editQuestionsOpen}
        diagram={diagram}
        onOpenChange={setEditQuestionsOpen}
        onSaveDiagram={saveDiagram}
      />
    </div>
  )
}
