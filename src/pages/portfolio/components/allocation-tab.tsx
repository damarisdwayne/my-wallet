import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
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

const emptyNewCat = () => ({
  name: '',
  type: 'stock' as AssetType,
  targetPercent: '10',
  color: '#3b82f6',
})

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  saveCategory: (cat: PortfolioCategory) => Promise<void>
}

export const AllocationTab = ({ assets, categories, totalValue, diagrams, answers, saveCategory }: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editTargetValue, setEditTargetValue] = useState('')
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [newCat, setNewCat] = useState(emptyNewCat())

  const saveTarget = async (id: string) => {
    const n = parseFloat(editTargetValue)
    if (!isNaN(n) && n >= 0 && n <= 100) {
      const cat = categories.find((c) => c.id === id)
      if (cat) await saveCategory({ ...cat, targetPercent: Math.round(n * 10) / 10 })
    }
    setEditingCategoryId(null)
  }

  const handleAddCategory = async () => {
    const name = newCat.name.trim()
    if (!name) return
    const target = parseFloat(newCat.targetPercent)
    const cat: PortfolioCategory = {
      id: `cat-${Date.now()}`,
      name,
      type: newCat.type,
      targetPercent: isNaN(target) ? 0 : Math.round(target * 10) / 10,
      color: newCat.color,
    }
    await saveCategory(cat)
    setNewCat(emptyNewCat())
    setAddCategoryOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Total alocado:{' '}
          <span
            className={cn(
              'font-semibold',
              Math.abs(categories.reduce((s, c) => s + c.targetPercent, 0) - 100) < 0.1
                ? 'text-success'
                : 'text-warning',
            )}
          >
            {categories.reduce((s, c) => s + c.targetPercent, 0).toFixed(1)}%
          </span>{' '}
          de 100%
        </p>
        <button
          onClick={() => setAddCategoryOpen(true)}
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
        const isEditing = editingCategoryId === cat.id

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
                    <span>Meta:</span>
                    <button
                      className="flex items-center gap-1 group"
                      onClick={() => {
                        setEditingCategoryId(cat.id)
                        setEditTargetValue(String(cat.targetPercent))
                      }}
                    >
                      <span className={isEditing ? 'text-primary font-semibold' : ''}>
                        {isEditing
                          ? `${parseFloat(editTargetValue || '0').toFixed(1)}%`
                          : `${cat.targetPercent}%`}
                      </span>
                      <Pencil
                        size={11}
                        className={cn(
                          'transition-colors',
                          isEditing
                            ? 'text-primary'
                            : 'text-muted-foreground/40 group-hover:text-primary',
                        )}
                      />
                    </button>
                  </div>
                  <span className="font-medium text-foreground">
                    Atual: {actualPct.toFixed(1)}%
                  </span>
                  <Badge variant={diff >= 0 ? 'success' : 'destructive'}>
                    {diff >= 0 ? '+' : ''}
                    {diff.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.5}
                    value={editTargetValue}
                    onChange={(e) => setEditTargetValue(e.target.value)}
                    className="flex-1 accent-primary cursor-pointer"
                    autoFocus
                  />
                  <span className="text-sm font-semibold text-primary w-12 text-right tabular-nums">
                    {parseFloat(editTargetValue || '0').toFixed(1)}%
                  </span>
                  <button
                    onClick={() => saveTarget(cat.id)}
                    className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {!isEditing && (
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(actualPct, 100)}%`, background: cat.color }}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {catAssets.map((a) => {
                  const v = a.currentPrice * a.quantity
                  return (
                    <div key={a.id} className="text-xs p-2 rounded bg-muted">
                      <p className="font-semibold text-foreground">{a.ticker}</p>
                      <p className="text-muted-foreground">{formatCurrency(v)}</p>
                      <p className="text-muted-foreground">Alvo: {(assetTargets.get(a.id) ?? 0).toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Dialog
        open={addCategoryOpen}
        onOpenChange={(open) => {
          setAddCategoryOpen(open)
          if (!open) setNewCat(emptyNewCat())
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>Defina nome, tipo, meta de alocação e cor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <input
                className={inputClass}
                placeholder="Ex: Ações Growth"
                value={newCat.name}
                onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo de ativo</label>
              <select
                className={inputClass}
                value={newCat.type}
                onChange={(e) => setNewCat((p) => ({ ...p, type: e.target.value as AssetType }))}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Meta de alocação (%)
              </label>
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={newCat.targetPercent}
                onChange={(e) => setNewCat((p) => ({ ...p, targetPercent: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cor</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newCat.color}
                  onChange={(e) => setNewCat((p) => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-md border border-input bg-background cursor-pointer p-0.5"
                />
                <span className="text-sm text-muted-foreground font-mono">{newCat.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setAddCategoryOpen(false)}
              className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Criar categoria
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
