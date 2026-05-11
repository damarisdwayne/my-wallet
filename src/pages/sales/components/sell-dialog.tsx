import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { SaleItem } from '@/types'
import { inputClass } from '../constants'
import { emptySellForm } from '../utils'

interface SellDialogProps {
  open: boolean
  item: SaleItem | null
  form: typeof emptySellForm
  onChange: (f: typeof emptySellForm) => void
  onClose: () => void
  onSubmit: () => void
}

export const SellDialog = ({ open, item, form, onChange, onClose, onSubmit }: SellDialogProps) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Registrar venda</DialogTitle>
        <DialogDescription>
          {item && (
            <span>
              <strong>{item.name}</strong> · comprado por {formatCurrency(item.buyPrice)}
            </span>
          )}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Preço de venda (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            placeholder="0,00"
            value={form.sellPrice}
            onChange={(e) => onChange({ ...form, sellPrice: e.target.value })}
          />
          {form.sellPrice && item && (
            <p className="text-xs text-muted-foreground">
              Lucro:{' '}
              <span
                className={
                  Number(form.sellPrice) - item.buyPrice >= 0
                    ? 'text-success font-medium'
                    : 'text-destructive font-medium'
                }
              >
                {formatCurrency(Number(form.sellPrice) - item.buyPrice)}
              </span>
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Data de venda</label>
          <input
            type="date"
            className={inputClass}
            value={form.soldAt}
            onChange={(e) => onChange({ ...form, soldAt: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          Confirmar venda
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
