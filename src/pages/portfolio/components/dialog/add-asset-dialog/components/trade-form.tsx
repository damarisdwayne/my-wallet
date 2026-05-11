import { useState } from 'react'
import type { Asset, Trade } from '@/types'
import { Field } from '../utils'
import { inputClass, todayStr } from '../constants'

export const TradeForm = ({
  opMode,
  assets,
  onSave,
}: {
  opMode: 'sell' | 'bonificacao' | 'amortizacao'
  assets: Asset[]
  onSave: (trade: Omit<Trade, 'id' | 'source'>) => void
}) => {
  const [form, setForm] = useState({ ticker: '', quantity: '', price: '', date: todayStr })
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const canSave = form.ticker.trim() && Number(form.quantity) > 0 && form.date

  const handleSave = () => {
    if (!canSave) return
    const qty = Number(form.quantity)
    const price = Number(form.price)
    const ticker = form.ticker.trim().toUpperCase()
    const type = opMode === 'sell' ? 'sell' : 'buy'
    const label =
      opMode === 'bonificacao'
        ? 'bonificacao'
        : opMode === 'amortizacao'
          ? 'amortizacao'
          : undefined
    onSave({ ticker, type, quantity: qty, price, total: qty * price, date: form.date, label })
  }

  const priceLabel =
    opMode === 'bonificacao' || opMode === 'amortizacao' ? 'Preço (pode ser R$0)' : 'Preço (R$)'

  return (
    <div className="space-y-3 mt-2">
      <Field label="Ativo">
        <input
          list="trade-ticker-list"
          className={inputClass}
          placeholder="Ex: SAPR4"
          value={form.ticker}
          onChange={(e) => set('ticker', e.target.value)}
        />
        <datalist id="trade-ticker-list">
          {assets.map((a) => (
            <option key={a.id} value={a.ticker} />
          ))}
        </datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantidade">
          <input
            type="number"
            min="0"
            step="any"
            className={inputClass}
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </Field>
        <Field label={priceLabel}>
          <input
            type="number"
            min="0"
            step="any"
            className={inputClass}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Data">
        <input
          type="date"
          className={inputClass}
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </Field>
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Salvar
      </button>
    </div>
  )
}
