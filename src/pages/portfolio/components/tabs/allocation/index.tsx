import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Asset, PortfolioCategory } from '@/types'
import { computeAssetTargets } from '../../../compute-targets'
import { emptyForm } from './constants'
import type { AllocationTabProps } from './types'
import {
  AssetAnswersDialog,
  CategoryCard,
  CategoryFormDialog,
  CreateDiagramDialog,
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
  saveAnswers,
}: AllocationTabProps) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm())
  const [editOpen, setEditOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<PortfolioCategory | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [expandedCatId, setExpandedCatId] = useState<string | null>(null)

  const [manualDrafts, setManualDrafts] = useState<Record<string, Record<string, string>>>({})
  const [savingManual, setSavingManual] = useState<string | null>(null)

  const [answeringAsset, setAnsweringAsset] = useState<Asset | null>(null)

  const [editQCatId, setEditQCatId] = useState<string | null>(null)

  const [createDiagCatId, setCreateDiagCatId] = useState<string | null>(null)
  const [newDiagName, setNewDiagName] = useState('')

  const setAdd = (k: string, v: string) => setAddForm((p) => ({ ...p, [k]: v }))
  const setEdit = (k: string, v: string) => setEditForm((p) => ({ ...p, [k]: v }))

  const handleAdd = async () => {
    const name = addForm.name.trim()
    if (!name) return
    const target = Number.parseFloat(addForm.targetPercent)
    await saveCategory({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      type: addForm.type,
      targetPercent: Number.isNaN(target) ? 0 : Math.round(target * 10) / 10,
      color: addForm.color,
    })
    setAddForm(emptyForm())
    setAddOpen(false)
  }

  const openEdit = (cat: PortfolioCategory) => {
    setEditingCat(cat)
    setEditForm({
      name: cat.name,
      type: cat.type,
      targetPercent: String(cat.targetPercent),
      color: cat.color,
    })
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingCat) return
    const target = Number.parseFloat(editForm.targetPercent)
    await saveCategory({
      ...editingCat,
      name: editForm.name.trim() || editingCat.name,
      type: editForm.type,
      targetPercent: Number.isNaN(target) ? editingCat.targetPercent : Math.round(target * 10) / 10,
      color: editForm.color,
    })
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

  const exitManual = async (catId: string, catAssets: Asset[]) => {
    setSavingManual(catId)
    await Promise.all(catAssets.map((a) => editAsset(a.id, { targetPercent: 0 })))
    setManualDrafts((prev) => {
      const n = { ...prev }
      delete n[catId]
      return n
    })
    setSavingManual(null)
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

  const getDiagram = (cat: PortfolioCategory) =>
    diagrams.find((d) =>
      d.categoryId
        ? d.categoryId === cat.id
        : assets.filter((a) => a.categoryId === cat.id).some((a) => d.appliesTo?.includes(a.type)),
    ) ?? null

  const setAnswer = async (questionId: string, value: 0 | 1) => {
    if (!answeringAsset) return
    await saveAnswers(answeringAsset.id, {
      ...(answers[answeringAsset.id] ?? {}),
      [questionId]: value,
    })
  }

  const createDiagram = async (catId: string) => {
    const name = newDiagName.trim()
    if (!name) return
    await saveDiagram({ id: `diag-${Date.now()}`, name, categoryId: catId, questions: [] })
    setCreateDiagCatId(null)
    setNewDiagName('')
  }

  const totalAllocated = categories.reduce((s, c) => s + c.targetPercent, 0)
  const editQDiagram = editQCatId ? getDiagram(categories.find((c) => c.id === editQCatId)!) : null
  const answeringDiagram = answeringAsset
    ? getDiagram(categories.find((c) => c.id === answeringAsset.categoryId)!)
    : null

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
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Nova categoria
        </button>
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
        const inManualMode = manual || draftActive
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
            onExitManual={() => exitManual(cat.id, catAssets)}
            onEnterManual={() => enterManual(cat.id, catAssets, cat)}
            onUpdateDraft={(assetId, value) => updateDraft(cat.id, assetId, value)}
            onSaveManual={() => saveManual(cat.id, catAssets)}
            onAnswerAsset={(asset) => setAnsweringAsset(asset)}
            onEditQuestions={() => setEditQCatId(cat.id)}
            onCreateDiagram={() => {
              setCreateDiagCatId(cat.id)
              setNewDiagName(cat.name)
            }}
          />
        )
      })}

      <CategoryFormDialog
        open={addOpen}
        title="Nova categoria"
        description="Defina nome, tipo, meta de alocação e cor."
        submitLabel="Criar categoria"
        disabled={!addForm.name.trim()}
        form={addForm}
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
        description="Altere nome, tipo, meta ou cor."
        submitLabel="Salvar"
        form={editForm}
        onSet={setEdit}
        onClose={() => {
          setEditOpen(false)
          setEditingCat(null)
        }}
        onSubmit={handleEditSave}
      />

      <CreateDiagramDialog
        open={!!createDiagCatId}
        value={newDiagName}
        onChange={setNewDiagName}
        onClose={() => {
          setCreateDiagCatId(null)
          setNewDiagName('')
        }}
        onSubmit={() => createDiagCatId && createDiagram(createDiagCatId)}
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
