import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatCurrency } from '@/lib/utils'
import type { Asset, AssetAnswers, AssetType, Diagram, DiagramQuestion, PortfolioCategory } from '@/types'
import { ASSET_TYPES, typeLabel } from '../constants'
import { computeAssetTargets } from '../compute-targets'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const emptyForm = () => ({
  name: '',
  type: 'stock' as AssetType,
  targetPercent: '10',
  color: '#3b82f6',
})

const calcScore = (answers: AssetAnswers, questions: DiagramQuestion[]) => {
  const yes = questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0)
  return { yes, total: questions.length }
}

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  saveCategory: (cat: PortfolioCategory) => Promise<void>
  deleteCategory: (catId: string) => Promise<void>
  editAsset: (assetId: string, data: Partial<Asset>) => Promise<void>
  saveDiagram: (diagram: Diagram) => Promise<void>
  saveAnswers: (assetId: string, answers: AssetAnswers) => Promise<void>
}

const CatFormFields = ({
  form,
  set,
  prefix,
}: {
  form: ReturnType<typeof emptyForm>
  set: (k: string, v: string) => void
  prefix: string
}) => (
  <div className="space-y-3 mt-2">
    <div>
      <label htmlFor={`${prefix}-name`} className="text-xs text-muted-foreground mb-1 block">
        Nome
      </label>
      <input
        id={`${prefix}-name`}
        className={inputClass}
        placeholder="Ex: Ações Growth"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        autoFocus
      />
    </div>
    <div>
      <label htmlFor={`${prefix}-type`} className="text-xs text-muted-foreground mb-1 block">
        Tipo de ativo
      </label>
      <select
        id={`${prefix}-type`}
        className={inputClass}
        value={form.type}
        onChange={(e) => set('type', e.target.value)}
      >
        {ASSET_TYPES.map((t) => (
          <option key={t} value={t}>
            {typeLabel[t]}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label htmlFor={`${prefix}-target`} className="text-xs text-muted-foreground mb-1 block">
        Meta de alocação (%)
      </label>
      <input
        id={`${prefix}-target`}
        className={inputClass}
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={form.targetPercent}
        onChange={(e) => set('targetPercent', e.target.value)}
      />
    </div>
    <div>
      <label htmlFor={`${prefix}-color`} className="text-xs text-muted-foreground mb-1 block">
        Cor
      </label>
      <div className="flex items-center gap-3">
        <input
          id={`${prefix}-color`}
          type="color"
          value={form.color}
          onChange={(e) => set('color', e.target.value)}
          className="w-10 h-10 rounded-md border border-input bg-background cursor-pointer p-0.5"
        />
        <span className="text-sm text-muted-foreground font-mono">{form.color}</span>
      </div>
    </div>
  </div>
)

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
}: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  // Category CRUD
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm())
  const [editOpen, setEditOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<PortfolioCategory | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Expanded asset section per category
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null)

  // Manual % drafts: catId → assetId → value string
  const [manualDrafts, setManualDrafts] = useState<Record<string, Record<string, string>>>({})
  const [savingManual, setSavingManual] = useState<string | null>(null)

  // Diagram question answering
  const [answeringAsset, setAnsweringAsset] = useState<Asset | null>(null)

  // Edit questions dialog
  const [editQCatId, setEditQCatId] = useState<string | null>(null)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<DiagramQuestion | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState('')

  // Create diagram dialog
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
    setEditForm({ name: cat.name, type: cat.type, targetPercent: String(cat.targetPercent), color: cat.color })
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

  // ── Manual % helpers ────────────────────────────────────────────
  const isManualCat = (catId: string) =>
    assets.filter((a) => a.categoryId === catId).some((a) => (a.targetPercent ?? 0) > 0)

  const getDraft = (catId: string, catAssets: Asset[]) => {
    if (manualDrafts[catId]) return manualDrafts[catId]
    return Object.fromEntries(catAssets.map((a) => [a.id, a.targetPercent > 0 ? String(a.targetPercent) : '']))
  }

  const enterManual = (catId: string, catAssets: Asset[], cat: PortfolioCategory) => {
    const share = (cat.targetPercent / catAssets.length).toFixed(1)
    setManualDrafts((prev) => ({
      ...prev,
      [catId]: Object.fromEntries(
        catAssets.map((a) => [a.id, a.targetPercent > 0 ? String(a.targetPercent) : share]),
      ),
    }))
  }

  const exitManual = async (catId: string, catAssets: Asset[]) => {
    setSavingManual(catId)
    await Promise.all(catAssets.map((a) => editAsset(a.id, { targetPercent: 0 })))
    setManualDrafts((prev) => { const n = { ...prev }; delete n[catId]; return n })
    setSavingManual(null)
  }

  const updateDraft = (catId: string, assetId: string, value: string) => {
    setManualDrafts((prev) => ({ ...prev, [catId]: { ...prev[catId], [assetId]: value } }))
  }

  const saveManual = async (catId: string, catAssets: Asset[]) => {
    const draft = manualDrafts[catId] ?? {}
    setSavingManual(catId)
    await Promise.all(catAssets.map((a) => editAsset(a.id, { targetPercent: Number(draft[a.id]) || 0 })))
    setSavingManual(null)
  }

  // ── Diagram helpers ─────────────────────────────────────────────
  const getDiagram = (cat: PortfolioCategory) =>
    diagrams.find((d) =>
      d.categoryId
        ? d.categoryId === cat.id
        : assets.filter((a) => a.categoryId === cat.id).some((a) => d.appliesTo?.includes(a.type)),
    ) ?? null

  const setAnswer = async (questionId: string, value: 0 | 1) => {
    if (!answeringAsset) return
    await saveAnswers(answeringAsset.id, { ...(answers[answeringAsset.id] ?? {}), [questionId]: value })
  }

  const addQuestion = async (diagram: Diagram) => {
    const text = newQuestionText.trim()
    if (!text) return
    await saveDiagram({ ...diagram, questions: [...diagram.questions, { id: `q-${Date.now()}`, text }] })
    setNewQuestionText('')
  }

  const removeQuestion = async (diagram: Diagram, qId: string) => {
    await saveDiagram({ ...diagram, questions: diagram.questions.filter((q) => q.id !== qId) })
  }

  const saveEditQuestion = async (diagram: Diagram) => {
    const text = editingQuestionText.trim()
    if (!text || !editingQuestion) return
    await saveDiagram({ ...diagram, questions: diagram.questions.map((q) => (q.id === editingQuestion.id ? { ...q, text } : q)) })
    setEditingQuestion(null)
    setEditingQuestionText('')
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
          <span className={cn('font-semibold', Math.abs(totalAllocated - 100) < 0.1 ? 'text-success' : 'text-warning')}>
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
        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma categoria criada ainda.</p>
      )}

      {categories.map((cat) => {
        const catAssets = assets.filter((a) => a.categoryId === cat.id)
        const catValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
        const actualPct = totalValue > 0 ? (catValue / totalValue) * 100 : 0
        const diff = actualPct - cat.targetPercent
        const expanded = expandedCatId === cat.id
        const manual = isManualCat(cat.id)
        const draftActive = !!manualDrafts[cat.id]
        const inManualMode = manual || draftActive
        const diagram = getDiagram(cat)
        const isSaving = savingManual === cat.id

        return (
          <Card key={cat.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                  <CardTitle className="text-foreground text-sm font-semibold">{cat.name}</CardTitle>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Meta: {cat.targetPercent}%</span>
                  <span className="font-medium text-foreground">Atual: {actualPct.toFixed(1)}%</span>
                  <Badge variant={diff >= 0 ? 'success' : 'destructive'}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                  </Badge>
                  <button onClick={() => openEdit(cat)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Pencil size={13} />
                  </button>
                  {confirmDeleteId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-destructive">Confirmar?</span>
                      <button onClick={() => handleDelete(cat.id)} className="px-1.5 py-0.5 rounded text-xs bg-destructive text-destructive-foreground">Sim</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">Não</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(cat.id)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(actualPct, 100)}%`, background: cat.color }} />
              </div>
            </CardHeader>

            {catAssets.length > 0 && cat.type !== 'fixed_income' && (
              <CardContent className="pt-0">
                <button
                  onClick={() => setExpandedCatId(expanded ? null : cat.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  {expanded ? 'Fechar ativos' : `Ver ${catAssets.length} ativo${catAssets.length !== 1 ? 's' : ''}`}
                </button>

                {expanded && (
                  <div className="space-y-4">
                    {/* Mode toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Alvo por ativo</span>
                      <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-xs">
                        <button
                          onClick={() => { if (inManualMode) exitManual(cat.id, catAssets) }}
                          className={cn('px-2.5 py-1 rounded-full transition-colors', !inManualMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                        >
                          Diagrama
                        </button>
                        <button
                          onClick={() => { if (!inManualMode) enterManual(cat.id, catAssets, cat) }}
                          className={cn('px-2.5 py-1 rounded-full transition-colors', inManualMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                        >
                          % Manual
                        </button>
                      </div>
                    </div>

                    {/* Manual mode */}
                    {inManualMode && (() => {
                      const draft = getDraft(cat.id, catAssets)
                      const draftSum = catAssets.reduce((s, a) => s + (Number(draft[a.id]) || 0), 0)
                      const sumOk = Math.abs(draftSum - cat.targetPercent) < 0.15
                      return (
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
                                      onChange={(e) => updateDraft(cat.id, a.id, e.target.value)}
                                    />
                                    <span className="text-xs text-muted-foreground">%</span>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max={cat.targetPercent}
                                  step="0.1"
                                  value={val}
                                  className="w-full accent-primary h-1.5 cursor-pointer"
                                  onChange={(e) => updateDraft(cat.id, a.id, e.target.value)}
                                />
                              </div>
                            )
                          })}
                          <div className="flex items-center justify-between pt-1">
                            <span className={cn('text-xs', sumOk ? 'text-success' : 'text-warning')}>
                              Soma: {draftSum.toFixed(1)}% {sumOk ? '✓' : `(meta: ${cat.targetPercent}%)`}
                            </span>
                            <button
                              onClick={() => saveManual(cat.id, catAssets)}
                              disabled={isSaving}
                              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                            >
                              {isSaving ? 'Salvando…' : 'Salvar'}
                            </button>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Diagram mode */}
                    {!inManualMode && (
                      <div className="space-y-2">
                        {!diagram ? (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-xs text-muted-foreground">Nenhum diagrama configurado</span>
                            <button
                              onClick={() => { setCreateDiagCatId(cat.id); setNewDiagName(cat.name) }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Plus size={12} />
                              Criar diagrama
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{diagram.name} · {diagram.questions.length} perguntas</span>
                              <button
                                onClick={() => setEditQCatId(cat.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil size={11} />
                                Perguntas
                              </button>
                            </div>
                            {catAssets.map((a) => {
                              const { yes, total } = calcScore(answers[a.id] ?? {}, diagram.questions)
                              const pct = total > 0 ? (yes / total) * 100 : 0
                              const scoreColor = pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-destructive'
                              return (
                                <button
                                  key={a.id}
                                  onClick={() => setAnsweringAsset(a)}
                                  className="w-full flex items-center gap-3 group text-left hover:bg-accent/40 rounded-md px-1 py-1.5 transition-colors"
                                >
                                  <div className="w-20 shrink-0">
                                    <p className="text-sm font-semibold text-foreground">{a.ticker}</p>
                                  </div>
                                  <div className="flex-1 bg-muted rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className={cn('shrink-0 text-xs font-bold w-10 text-right tabular-nums', scoreColor)}>
                                    {yes}/{total}
                                  </span>
                                  <span className="w-12 text-xs text-right text-muted-foreground shrink-0">
                                    {(assetTargets.get(a.id) ?? 0).toFixed(1)}%
                                  </span>
                                  <ChevronRight size={12} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsed: just show asset chips */}
                {!expanded && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {catAssets.map((a) => (
                      <div key={a.id} className="text-xs p-2 rounded bg-muted">
                        <p className="font-semibold text-foreground">{a.ticker}</p>
                        <p className="text-muted-foreground">{formatCurrency(a.currentPrice * a.quantity)}</p>
                        <p className="text-muted-foreground">
                          Alvo: {(assetTargets.get(a.id) ?? 0).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Add category */}
      <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) setAddForm(emptyForm()) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>Defina nome, tipo, meta de alocação e cor.</DialogDescription>
          </DialogHeader>
          <CatFormFields form={addForm} set={setAdd} prefix="add" />
          <DialogFooter className="mt-4">
            <button onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleAdd} disabled={!addForm.name.trim()} className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">Criar categoria</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit category */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditingCat(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>Altere nome, tipo, meta ou cor.</DialogDescription>
          </DialogHeader>
          <CatFormFields form={editForm} set={setEdit} prefix="edit" />
          <DialogFooter className="mt-4">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleEditSave} className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create diagram */}
      <Dialog open={!!createDiagCatId} onOpenChange={(v) => { if (!v) { setCreateDiagCatId(null); setNewDiagName('') } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Criar diagrama</DialogTitle>
            <DialogDescription>Dê um nome ao diagrama para a categoria selecionada.</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <input
              className={inputClass}
              placeholder="Nome do diagrama"
              value={newDiagName}
              onChange={(e) => setNewDiagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createDiagCatId && createDiagram(createDiagCatId)}
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <button onClick={() => { setCreateDiagCatId(null); setNewDiagName('') }} className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={() => createDiagCatId && createDiagram(createDiagCatId)} disabled={!newDiagName.trim()} className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">Criar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Answer diagram questions */}
      {answeringAsset && answeringDiagram && (
        <Dialog open onOpenChange={(v) => !v && setAnsweringAsset(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{answeringAsset.ticker} — {answeringDiagram.name}</DialogTitle>
              <DialogDescription>
                Pontuação:{' '}
                <strong>
                  {calcScore(answers[answeringAsset.id] ?? {}, answeringDiagram.questions).yes}/
                  {calcScore(answers[answeringAsset.id] ?? {}, answeringDiagram.questions).total}
                </strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {answeringDiagram.questions.map((q, i) => {
                const val = (answers[answeringAsset.id] ?? {})[q.id] ?? -1
                return (
                  <div key={q.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="flex-1 text-sm text-foreground">{q.text}</p>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setAnswer(q.id, 1)} className={cn('px-2.5 py-1 rounded text-xs font-semibold transition-colors', val === 1 ? 'bg-success text-white' : 'bg-muted text-muted-foreground hover:bg-success/20 hover:text-success')}>Sim</button>
                      <button onClick={() => setAnswer(q.id, 0)} className={cn('px-2.5 py-1 rounded text-xs font-semibold transition-colors', val === 0 ? 'bg-destructive/80 text-white' : 'bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive')}>Não</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit diagram questions */}
      {editQDiagram && (
        <Dialog open={!!editQCatId} onOpenChange={(v) => { if (!v) { setEditQCatId(null); setEditingQuestion(null) } }}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perguntas — {editQDiagram.name}</DialogTitle>
              <DialogDescription>Adicione, edite ou remova perguntas do diagrama.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 mt-2">
              {editQDiagram.questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 mt-2">{i + 1}.</span>
                  {editingQuestion?.id === q.id ? (
                    <div className="flex-1 flex gap-2">
                      <input className={cn(inputClass, 'flex-1')} value={editingQuestionText} onChange={(e) => setEditingQuestionText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditQuestion(editQDiagram)} autoFocus />
                      <button onClick={() => saveEditQuestion(editQDiagram)} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">OK</button>
                      <button onClick={() => setEditingQuestion(null)} className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">✕</button>
                    </div>
                  ) : (
                    <>
                      <p className="flex-1 text-sm text-foreground py-1.5">{q.text}</p>
                      <button onClick={() => { setEditingQuestion(q); setEditingQuestionText(q.text) }} className="p-1.5 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => removeQuestion(editQDiagram, q.id)} className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter className="flex-col gap-2 mt-2">
              <div className="flex gap-2 w-full">
                <input className={cn(inputClass, 'flex-1')} placeholder="Nova pergunta..." value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuestion(editQDiagram)} />
                <button onClick={() => addQuestion(editQDiagram)} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shrink-0">
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
