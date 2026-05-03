import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { Asset, PortfolioCategory } from '@/types'
import { inputClass } from '../constants'

interface EditAssetDialogProps {
  asset: Asset | null
  categories: PortfolioCategory[]
  assets: Asset[]
  onClose: () => void
  editAsset: (id: string, data: Partial<Asset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
}

export const EditAssetDialog = ({
  asset,
  categories,
  assets,
  onClose,
  editAsset,
  deleteAsset,
}: EditAssetDialogProps) => {
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editTicker, setEditTicker] = useState('')
  const [editName, setEditName] = useState('')
  const [editQty, setEditQty] = useState('')
  const [editAvgPrice, setEditAvgPrice] = useState('')
  const [splitRatio, setSplitRatio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (asset) {
      setEditCategoryId(asset.categoryId)
      setEditTicker(asset.ticker)
      setEditName(asset.name)
      setEditQty(String(asset.quantity))
      setEditAvgPrice(String(asset.avgPrice))
      setSplitRatio('')
    }
  }, [asset])

  const handleEditSave = async () => {
    if (!asset) return
    setSaving(true)
    try {
      const newTicker = editTicker.trim().toUpperCase()
      const ratio = splitRatio ? Number(splitRatio) : null
      const directQty = Number(editQty)
      const directAvg = Number(editAvgPrice)

      const srcQty =
        ratio && ratio > 0 && ratio !== 1
          ? Math.round(asset.quantity * ratio)
          : directQty > 0
            ? directQty
            : asset.quantity
      const srcAvg =
        ratio && ratio > 0 && ratio !== 1
          ? asset.avgPrice / ratio
          : directAvg > 0
            ? directAvg
            : asset.avgPrice

      const duplicate = assets.find(
        (a) => a.id !== asset.id && a.ticker.toUpperCase() === newTicker,
      )

      if (duplicate) {
        const mergedQty = duplicate.quantity + srcQty
        const mergedAvg = (duplicate.quantity * duplicate.avgPrice + srcQty * srcAvg) / mergedQty
        await editAsset(duplicate.id, { quantity: mergedQty, avgPrice: mergedAvg })
        await deleteAsset(asset.id)
      } else {
        const newCatType = categories.find((c) => c.id === editCategoryId)?.type
        const updates: Partial<Asset> = {
          categoryId: editCategoryId,
          ...(newCatType ? { type: newCatType } : {}),
          ticker: newTicker,
          name: editName.trim(),
          quantity: srcQty,
          avgPrice: srcAvg,
        }
        await editAsset(asset.id, updates)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!asset} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar {asset?.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-ticker" className="text-xs text-muted-foreground mb-1 block">
                Ticker
              </label>
              <input
                id="edit-ticker"
                className={inputClass}
                value={editTicker}
                onChange={(e) => setEditTicker(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-name" className="text-xs text-muted-foreground mb-1 block">
                Nome
              </label>
              <input
                id="edit-name"
                className={inputClass}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-category" className="text-xs text-muted-foreground mb-1 block">
              Categoria
            </label>
            <select
              id="edit-category"
              className={inputClass}
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-qty" className="text-xs text-muted-foreground mb-1 block">
                Quantidade
              </label>
              <input
                id="edit-qty"
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-avg" className="text-xs text-muted-foreground mb-1 block">
                PM (R$)
              </label>
              <input
                id="edit-avg"
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={editAvgPrice}
                onChange={(e) => setEditAvgPrice(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-split" className="text-xs text-muted-foreground mb-1 block">
              Desdobramento / Grupamento{' '}
              <span className="text-muted-foreground/60">(ex: 2 = dobra qtd, 0.5 = agrupa)</span>
            </label>
            <input
              id="edit-split"
              type="number"
              min="0.01"
              step="any"
              placeholder="1 = sem alteração"
              className={inputClass}
              value={splitRatio}
              onChange={(e) => setSplitRatio(e.target.value)}
            />
            {splitRatio && Number(splitRatio) > 0 && Number(splitRatio) !== 1 && asset && (
              <p className="text-xs text-muted-foreground mt-1">
                {asset.quantity} → {Math.round(asset.quantity * Number(splitRatio))}{' '}
                cotas · PM {formatCurrency(asset.avgPrice)} →{' '}
                {formatCurrency(asset.avgPrice / Number(splitRatio))}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEditSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
