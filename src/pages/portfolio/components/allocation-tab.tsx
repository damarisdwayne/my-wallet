import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import type { Asset, AssetAnswers, AssetType, Diagram, PortfolioCategory } from '@/types'
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

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  saveCategory: (cat: PortfolioCategory) => Promise<void>
  deleteCategory: (catId: string) => Promise<void>
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
}: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm())

  const [editOpen, setEditOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<PortfolioCategory | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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

  const totalAllocated = categories.reduce((s, c) => s + c.targetPercent, 0)

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

        return (
          <Card key={cat.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                  <CardTitle className="text-foreground text-sm font-semibold">
                    {cat.name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Meta: {cat.targetPercent}%</span>
                  </div>
                  <span className="font-medium text-foreground">
                    Atual: {actualPct.toFixed(1)}%
                  </span>
                  <Badge variant={diff >= 0 ? 'success' : 'destructive'}>
                    {diff >= 0 ? '+' : ''}
                    {diff.toFixed(1)}%
                  </Badge>
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Editar categoria"
                  >
                    <Pencil size={13} />
                  </button>
                  {confirmDeleteId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-destructive">Confirmar?</span>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="px-1.5 py-0.5 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                      title="Excluir categoria"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(actualPct, 100)}%`, background: cat.color }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {catAssets.map((a) => {
                  const v = a.currentPrice * a.quantity
                  return (
                    <div key={a.id} className="text-xs p-2 rounded bg-muted">
                      <p className="font-semibold text-foreground">{a.ticker}</p>
                      <p className="text-muted-foreground">{formatCurrency(v)}</p>
                      <p className="text-muted-foreground">
                        Alvo: {(assetTargets.get(a.id) ?? 0).toFixed(1)}%
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Add dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(v) => {
          setAddOpen(v)
          if (!v) setAddForm(emptyForm())
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>Defina nome, tipo, meta de alocação e cor.</DialogDescription>
          </DialogHeader>
          <CatFormFields form={addForm} set={setAdd} prefix="add" />
          <DialogFooter className="mt-4">
            <button
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!addForm.name.trim()}
              className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Criar categoria
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v)
          if (!v) setEditingCat(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>Altere nome, tipo, meta ou cor.</DialogDescription>
          </DialogHeader>
          <CatFormFields form={editForm} set={setEdit} prefix="edit" />
          <DialogFooter className="mt-4">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditSave}
              className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
