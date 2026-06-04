import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { Trade } from '@/types'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  trade: Trade | null
  onClose: () => void
  onSave: (tradeId: string, patch: Partial<Trade>) => Promise<void>
}

// Render with key={trade?.id} so each open remounts with fresh state (no setState-in-effect).
export const EditTradeDialog = ({ trade, onClose, onSave }: Props) => {
  const [date, setDate] = useState(trade?.date ?? '')
  const [type, setType] = useState<'buy' | 'sell'>(trade?.type ?? 'buy')
  const [quantity, setQuantity] = useState(trade ? String(trade.quantity) : '')
  const [price, setPrice] = useState(trade ? String(trade.price) : '')
  const [saving, setSaving] = useState(false)

  const qty = Number(quantity) || 0
  const prc = Number(price) || 0

  const handleSave = async () => {
    if (!trade || qty <= 0) return
    setSaving(true)
    try {
      await onSave(trade.id, { date, type, quantity: qty, price: prc, total: qty * prc })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!trade} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar movimentação — {trade?.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="et-date" className="text-xs text-muted-foreground mb-1 block">
                Data
              </label>
              <input
                id="et-date"
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="et-type" className="text-xs text-muted-foreground mb-1 block">
                Tipo
              </label>
              <select
                id="et-type"
                className={inputClass}
                value={type}
                onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
              >
                <option value="buy">Compra</option>
                <option value="sell">Venda</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="et-qty" className="text-xs text-muted-foreground mb-1 block">
                Quantidade
              </label>
              <input
                id="et-qty"
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="et-price" className="text-xs text-muted-foreground mb-1 block">
                Preço (R$)
              </label>
              <input
                id="et-price"
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(qty * prc)}</span>{' '}
            · a posição é recalculada ao salvar.
          </p>
        </div>
        <DialogFooter className="mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || qty <= 0}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
