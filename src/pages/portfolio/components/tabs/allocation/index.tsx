import { useState } from 'react'
import { GitBranch, ListChecks, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Asset, Diagram, PortfolioCategory } from '@/types'
import { computeAssetTargets } from '../../../compute-targets'
import { emptyForm } from './constants'
import type { AllocationTabProps } from './types'
import {
  AssignAssetsSheet,
  AssetAnswersDialog,
  CategoryCard,
  CategoryFormDialog,
  DiagramsSheet,
  EditQuestionsDialog,
} from './components'

export const AllocationTab = ({
  assets,
  categories,
  totalValue,
  diagrams,
  answers,
  saveCategory,
  deleteCategory,
  editAsset,
  saveDiagram,
  deleteDiagram,
  saveAnswers,
}: AllocationTabProps) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm())
  const [editOpen, setEditOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<PortfolioCategory | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [diagramsOpen, setDiagramsOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null)
  const [manualDrafts, setManualDrafts] = useState<Record<string, Record<string, string>>>({})
  const [diagramViewCats, setDiagramViewCats] = useState<Set<string>>(new Set())
  const [savingManual, setSavingManual] = useState<string | null>(null)
  const [answeringAsset, setAnsweringAsset] = useState<Asset | null>(null)
  const [editQCatId, setEditQCatId] = useState<string | null>(null)

  const setAdd = (k: string, v: string | import('@/types').AssetType[]) =>
    setAddForm((p) => ({ ...p, [k]: v }))
  const setEdit = (k: string, v: string | import('@/types').AssetType[]) =>
    setEditForm((p) => ({ ...p, [k]: v }))

  // Link/unlink diagram when a category is saved with a diagram selection
  const applyDiagramLink = async (
    catId: string,
    selectedDiagramId: string,
    newDiagramName: string,
  ) => {
    if (selectedDiagramId === 'new' && newDiagramName.trim()) {
      await saveDiagram({
        id: `diag-${Date.now()}`,
        name: newDiagramName.trim(),
        categoryId: catId,
        questions: [],
      })
      return
    }
    if (selectedDiagramId && selectedDiagramId !== 'new') {
      const diag = diagrams.find((d) => d.id === selectedDiagramId)
      if (diag) await saveDiagram({ ...diag, categoryId: catId })
    }
    // Unlink any diagram previously pointing to this category (if a different one is now selected)
    const prev = diagrams.find((d) => d.categoryId === catId && d.id !== selectedDiagramId)
    if (prev) await saveDiagram({ ...prev, categoryId: '' })
  }

  const handleAdd = async () => {
    const name = addForm.name.trim()
    if (!name || addForm.assetTypes.length === 0) return
    const target = Number.parseFloat(addForm.targetPercent)
    const catId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    await saveCategory({
      id: catId,
      name,
      assetTypes: addForm.assetTypes,
      targetPercent: Number.isNaN(target) ? 0 : Math.round(target * 10) / 10,
      color: addForm.color,
      tracking: addForm.tracking,
    })
    await applyDiagramLink(catId, addForm.selectedDiagramId, addForm.newDiagramName)
    setAddForm(emptyForm())
    setAddOpen(false)
  }

  const openEdit = (cat: PortfolioCategory) => {
    const linkedDiagram = diagrams.find((d) => d.categoryId === cat.id)
    setEditingCat(cat)
    setEditForm({
      name: cat.name,
      assetTypes: cat.assetTypes,
      targetPercent: String(cat.targetPercent),
      color: cat.color,
      tracking: cat.tracking,
      selectedDiagramId: linkedDiagram?.id ?? '',
      newDiagramName: '',
    })
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingCat) return
    const target = Number.parseFloat(editForm.targetPercent)
    await saveCategory({
      ...editingCat,
      name: editForm.name.trim() || editingCat.name,
      assetTypes: editForm.assetTypes.length > 0 ? editForm.assetTypes : editingCat.assetTypes,
      targetPercent: Number.isNaN(target) ? editingCat.targetPercent : Math.round(target * 10) / 10,
      color: editForm.color,
      tracking: editForm.tracking,
    })
    await applyDiagramLink(editingCat.id, editForm.selectedDiagramId, editForm.newDiagramName)
    setEditOpen(false)
    setEditingCat(null)
  }

  const handleDelete = async (catId: string) => {
    await deleteCategory(catId)
    setConfirmDeleteId(null)
  }

  const isManualCat = (catId: string) =>
    assets.filter((a) => a.categoryId === catId).some((a) => (a.targetPercent ?? 0) > 0)

  const getDraft = (catId: string, catAssets: Asset[], cat: PortfolioCategory) => {
    if (manualDrafts[catId]) return manualDrafts[catId]
    return Object.fromEntries(
      catAssets.map((a) => {
        if (a.targetPercent > 0 && cat.targetPercent > 0) {
          return [a.id, ((a.targetPercent / cat.targetPercent) * 100).toFixed(1)]
        }
        return [a.id, '0']
      }),
    )
  }

  const enterManual = (catId: string, catAssets: Asset[], cat: PortfolioCategory) => {
    const share = (100 / catAssets.length).toFixed(1)
    setDiagramViewCats((prev) => {
      const s = new Set(prev)
      s.delete(catId)
      return s
    })
    setManualDrafts((prev) => ({
      ...prev,
      [catId]: Object.fromEntries(
        catAssets.map((a) => {
          if (a.targetPercent > 0 && cat.targetPercent > 0) {
            return [a.id, ((a.targetPercent / cat.targetPercent) * 100).toFixed(1)]
          }
          return [a.id, share]
        }),
      ),
    }))
  }

  const exitManual = (catId: string) => {
    setDiagramViewCats((prev) => new Set([...prev, catId]))
    setManualDrafts((prev) => {
      const n = { ...prev }
      delete n[catId]
      return n
    })
  }

  const updateDraft = (catId: string, assetId: string, value: string) => {
    setManualDrafts((prev) => ({ ...prev, [catId]: { ...prev[catId], [assetId]: value } }))
  }

  const saveManual = async (catId: string, catAssets: Asset[]) => {
    const draft = manualDrafts[catId] ?? {}
    const cat = categories.find((c) => c.id === catId)
    const catPct = cat?.targetPercent ?? 0
    setSavingManual(catId)
    await Promise.all(
      catAssets.map((a) => {
        const withinCat = Number(draft[a.id]) || 0
        return editAsset(a.id, { targetPercent: (withinCat / 100) * catPct })
      }),
    )
    setSavingManual(null)
  }

  const getDiagram = (cat: PortfolioCategory): Diagram | null =>
    diagrams.find((d) =>
      d.categoryId
        ? d.categoryId === cat.id
        : assets.filter((a) => a.categoryId === cat.id).some((a) => d.appliesTo?.includes(a.type)),
    ) ?? null

  const setAnswer = async (questionId: string, value: 0 | 1) => {
    if (!answeringAsset) return
    const existing = answers[answeringAsset.id] ?? {}
    await saveAnswers(answeringAsset.id, { ...existing, [questionId]: value })
  }

  const totalAllocated = categories.reduce((s, c) => s + c.targetPercent, 0)
  const editQCat = categories.find((c) => c.id === editQCatId)
  const editQDiagram = editQCat ? getDiagram(editQCat) : null
  const answeringCat = categories.find((c) => c.id === answeringAsset?.categoryId)
  const answeringDiagram = answeringCat ? getDiagram(answeringCat) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Total alocado:{' '}
          <span
            className={cn(
              'font-semibold',
              Math.abs(totalAllocated - 100) < 0.1 ? 'text-success' : 'text-warning',
            )}
          >
            {totalAllocated.toFixed(1)}%
          </span>{' '}
          de 100%
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAssignOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ListChecks size={14} />
            Categorizar Ativos
          </button>
          <button
            onClick={() => setDiagramsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <GitBranch size={14} />
            Diagramas
            {diagrams.length > 0 && <span className="text-xs opacity-60">({diagrams.length})</span>}
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            Nova categoria
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma categoria criada ainda.
        </p>
      )}

      {categories.map((cat) => {
        const catAssets = assets.filter((a) => a.categoryId === cat.id)
        const catValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
        const actualPct = totalValue > 0 ? (catValue / totalValue) * 100 : 0
        const diff = actualPct - cat.targetPercent
        const catTargetValue = (cat.targetPercent / 100) * totalValue
        const expanded = expandedCatId === cat.id
        const manual = isManualCat(cat.id)
        const draftActive = !!manualDrafts[cat.id]
        const inManualMode = (manual || draftActive) && !diagramViewCats.has(cat.id)
        const diagram = getDiagram(cat)
        const isSaving = savingManual === cat.id

        return (
          <CategoryCard
            key={cat.id}
            cat={cat}
            catAssets={catAssets}
            catValue={catValue}
            actualPct={actualPct}
            diff={diff}
            catTargetValue={catTargetValue}
            expanded={expanded}
            inManualMode={inManualMode}
            diagram={diagram}
            isSaving={isSaving}
            answers={answers}
            assetTargets={assetTargets}
            confirmDeleteId={confirmDeleteId}
            draft={getDraft(cat.id, catAssets, cat)}
            onToggleExpand={() => setExpandedCatId(expanded ? null : cat.id)}
            onEdit={() => openEdit(cat)}
            onConfirmDelete={() => setConfirmDeleteId(cat.id)}
            onCancelDelete={() => setConfirmDeleteId(null)}
            onDelete={() => handleDelete(cat.id)}
            onExitManual={() => exitManual(cat.id)}
            onEnterManual={() => enterManual(cat.id, catAssets, cat)}
            onUpdateDraft={(assetId, value) => updateDraft(cat.id, assetId, value)}
            onSaveManual={() => saveManual(cat.id, catAssets)}
            onAnswerAsset={(asset) => setAnsweringAsset(asset)}
            onEditQuestions={() => setEditQCatId(cat.id)}
            onCreateDiagram={() => {
              // Open edit dialog on the category with tracking set to include diagram
              openEdit({ ...cat, tracking: cat.tracking === 'goal_only' ? 'both' : cat.tracking })
            }}
          />
        )
      })}

      <AssignAssetsSheet
        open={assignOpen}
        assets={assets}
        categories={categories}
        totalValue={totalValue}
        editAsset={editAsset}
        onClose={() => setAssignOpen(false)}
      />

      <DiagramsSheet
        open={diagramsOpen}
        diagrams={diagrams}
        categories={categories}
        saveDiagram={saveDiagram}
        deleteDiagram={deleteDiagram}
        onClose={() => setDiagramsOpen(false)}
      />

      <CategoryFormDialog
        open={addOpen}
        title="Nova categoria"
        description="Defina nome, tipos, modo de acompanhamento e cor."
        submitLabel="Criar categoria"
        disabled={!addForm.name.trim()}
        form={addForm}
        diagrams={diagrams}
        onSet={setAdd}
        onClose={() => {
          setAddOpen(false)
          setAddForm(emptyForm())
        }}
        onSubmit={handleAdd}
      />

      <CategoryFormDialog
        open={editOpen}
        title="Editar categoria"
        description="Altere nome, tipos, modo ou diagrama."
        submitLabel="Salvar"
        form={editForm}
        diagrams={diagrams}
        onSet={setEdit}
        onClose={() => {
          setEditOpen(false)
          setEditingCat(null)
        }}
        onSubmit={handleEditSave}
      />

      {answeringAsset && answeringDiagram && (
        <AssetAnswersDialog
          asset={answeringAsset}
          diagram={answeringDiagram}
          answers={answers}
          onClose={() => setAnsweringAsset(null)}
          onSetAnswer={setAnswer}
        />
      )}

      {editQDiagram && (
        <EditQuestionsDialog
          open={!!editQCatId}
          diagram={editQDiagram}
          onOpenChange={(v) => {
            if (!v) setEditQCatId(null)
          }}
          onSaveDiagram={saveDiagram}
        />
      )}
    </div>
  )
}
