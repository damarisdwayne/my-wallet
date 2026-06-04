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
  const [splitRatio, setSplitRatio] = useState('')
  const [previousTickers, setPreviousTickers] = useState('')
  const [pauseAporte, setPauseAporte] = useState(false)
  const [ceilingPrice, setCeilingPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const isFixedIncome = asset?.type === 'fixed_income' || asset?.type === 'tesouro'

  useEffect(() => {
    if (asset) {
      setEditCategoryId(asset.categoryId)
      setEditTicker(asset.ticker)
      setEditName(asset.name)
      setSplitRatio('')
      setPreviousTickers(asset.previousTickers?.join(', ') ?? '')
      setPauseAporte(asset.pauseAporte ?? false)
      setCeilingPrice(asset.ceilingPrice ? String(asset.ceilingPrice) : '')
    }
  }, [asset])

  const handleEditSave = async () => {
    if (!asset) return
    setSaving(true)
    try {
      const newTicker =
        asset.type === 'fixed_income' ? editTicker.trim() : editTicker.trim().toUpperCase()
      const ratio = splitRatio ? Number(splitRatio) : null
      // Quantidade/PM não são editados aqui — só mudam por desdobro/grupamento (evento corporativo)
      // ou pelas movimentações. O resto é metadado.
      const splitApplied = !!(ratio && ratio > 0 && ratio !== 1)
      const srcQty = splitApplied ? Math.round(asset.quantity * ratio) : asset.quantity
      const srcAvg = splitApplied ? asset.avgPrice / ratio : asset.avgPrice

      const duplicate = assets.find(
        (a) => a.id !== asset.id && a.ticker.toUpperCase() === newTicker,
      )

      if (duplicate) {
        const mergedQty = duplicate.quantity + srcQty
        const mergedAvg = (duplicate.quantity * duplicate.avgPrice + srcQty * srcAvg) / mergedQty
        await editAsset(duplicate.id, { quantity: mergedQty, avgPrice: mergedAvg })
        await deleteAsset(asset.id)
      } else {
        const prev = previousTickers
          .split(',')
          .map((t) => t.trim().toUpperCase())
          .filter(Boolean)
        const parsedCeiling = Number.parseFloat(ceilingPrice)
        const updates: Partial<Asset> = {
          categoryId: editCategoryId,
          ticker: newTicker,
          name: editName.trim(),
          previousTickers: prev.length > 0 ? prev : undefined,
          pauseAporte: isFixedIncome ? false : pauseAporte,
          ceilingPrice: !isFixedIncome && parsedCeiling > 0 ? parsedCeiling : undefined,
        }
        // Só mexe em quantidade/PM quando há desdobro/grupamento.
        if (splitApplied) {
          updates.quantity = srcQty
          updates.avgPrice = srcAvg
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
          {asset && (
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2.5 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quantidade</span>
                <span className="font-medium text-foreground">{asset.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preço médio</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(asset.avgPrice)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/80 pt-1">
                Quantidade e PM vêm das movimentações. Para corrigir, edite na aba{' '}
                <span className="font-medium">Movimentações</span> (assim o IR fica consistente).
              </p>
            </div>
          )}
          {!isFixedIncome && asset?.type !== 'crypto' && (
            <>
              <div>
                <label
                  htmlFor="edit-prev-tickers"
                  className="text-xs text-muted-foreground mb-1 block"
                >
                  Tickers anteriores{' '}
                  <span className="text-muted-foreground/60">(separados por vírgula)</span>
                </label>
                <input
                  id="edit-prev-tickers"
                  className={inputClass}
                  placeholder="Ex: MALL11, IRDM11"
                  value={previousTickers}
                  onChange={(e) => setPreviousTickers(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-split" className="text-xs text-muted-foreground mb-1 block">
                  Desdobramento / Grupamento{' '}
                  <span className="text-muted-foreground/60">
                    (ex: 2 = dobra qtd, 0.5 = agrupa)
                  </span>
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
                    {asset.quantity} → {Math.round(asset.quantity * Number(splitRatio))} cotas · PM{' '}
                    {formatCurrency(asset.avgPrice)} →{' '}
                    {formatCurrency(asset.avgPrice / Number(splitRatio))}
                  </p>
                )}
              </div>
            </>
          )}
          {!isFixedIncome && (
            <>
              <div>
                <label htmlFor="edit-ceiling" className="text-xs text-muted-foreground mb-1 block">
                  Preço teto (R$){' '}
                  <span className="text-muted-foreground/60">— pausa aporte se atingido</span>
                </label>
                <input
                  id="edit-ceiling"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Sem teto"
                  className={inputClass}
                  value={ceilingPrice}
                  onChange={(e) => setCeilingPrice(e.target.value)}
                />
                {asset && ceilingPrice && Number(ceilingPrice) > 0 && asset.currentPrice > 0 && (
                  <p
                    className={`text-xs mt-1 ${asset.currentPrice >= Number(ceilingPrice) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
                  >
                    Preço atual: {formatCurrency(asset.currentPrice)}
                    {asset.currentPrice >= Number(ceilingPrice) ? ' — teto atingido' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Pausar aporte</p>
                  <p className="text-xs text-muted-foreground">Excluir manualmente da simulação</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pauseAporte}
                  onClick={() => setPauseAporte((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${pauseAporte ? 'bg-destructive' : 'bg-muted'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${pauseAporte ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </>
          )}
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
