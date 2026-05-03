import type { SaleCategory } from '@/types'
import { inputClass } from '../constants'
import { emptyBuyForm, saleCategories } from '../utils'

interface BuyFormFieldsProps {
  prefix: string
  form: typeof emptyBuyForm
  onChange: (f: typeof emptyBuyForm) => void
}

export const BuyFormFields = ({ prefix, form, onChange }: BuyFormFieldsProps) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <label htmlFor={`${prefix}-name`} className="text-sm font-medium text-foreground">
        Nome do item
      </label>
      <input
        id={`${prefix}-name`}
        className={inputClass}
        placeholder="Ex: RTX 4070 Ti"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        autoFocus
      />
    </div>
    <div className="space-y-1.5">
      <label htmlFor={`${prefix}-cat`} className="text-sm font-medium text-foreground">
        Categoria
      </label>
      <select
        id={`${prefix}-cat`}
        className={inputClass}
        value={form.category}
        onChange={(e) => onChange({ ...form, category: e.target.value as SaleCategory })}
      >
        {Object.entries(saleCategories).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-buy`} className="text-sm font-medium text-foreground">
          Preço de compra (R$)
        </label>
        <input
          id={`${prefix}-buy`}
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          placeholder="0,00"
          value={form.buyPrice}
          onChange={(e) => onChange({ ...form, buyPrice: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-date`} className="text-sm font-medium text-foreground">
          Data de compra
        </label>
        <input
          id={`${prefix}-date`}
          type="date"
          className={inputClass}
          value={form.boughtAt}
          onChange={(e) => onChange({ ...form, boughtAt: e.target.value })}
        />
      </div>
    </div>
    <div className="space-y-1.5">
      <label htmlFor={`${prefix}-notes`} className="text-sm font-medium text-foreground">
        Observações <span className="text-muted-foreground">(opcional)</span>
      </label>
      <textarea
        id={`${prefix}-notes`}
        className={inputClass}
        rows={2}
        placeholder="Ex: Comprado no Kabum"
        value={form.notes}
        onChange={(e) => onChange({ ...form, notes: e.target.value })}
      />
    </div>
  </div>
)
