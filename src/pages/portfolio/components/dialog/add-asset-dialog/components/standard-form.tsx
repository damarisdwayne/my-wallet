import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Asset, AssetType, PortfolioCategory } from '@/types'
import { Field } from '../utils'
import { inputClass } from '../constants'

export const StandardForm = ({
  type,
  categories,
  onSave,
}: {
  type: AssetType
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const [form, setForm] = useState({
    ticker: '',
    name: '',
    quantity: '',
    avgPrice: '',
    currentPrice: '',
    targetPercent: '10',
    categoryId: '',
    autoCategory: true,
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const autoCatId = categories.find((c) => c.assetTypes.includes(type))?.id ?? ''
  const resolvedCatId = form.autoCategory ? autoCatId : form.categoryId
  const resolvedCatName = form.autoCategory
    ? (categories.find((c) => c.id === autoCatId)?.name ?? 'Nenhuma encontrada')
    : (categories.find((c) => c.id === form.categoryId)?.name ?? '—')

  const canSave = form.ticker.trim() && form.name.trim()

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Ticker">
          <input
            className={inputClass}
            placeholder="PETR4"
            value={form.ticker}
            onChange={(e) => set('ticker', e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Nome">
          <input
            className={inputClass}
            placeholder="Petrobras PN"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Field label="Quantidade">
          <input
            className={inputClass}
            type="number"
            min={0}
            placeholder="100"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </Field>
        <Field label="PM (R$)">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="30.00"
            value={form.avgPrice}
            onChange={(e) => set('avgPrice', e.target.value)}
          />
        </Field>
        <Field label="Atual (R$)" className="col-span-2 sm:col-span-1">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="35.00"
            value={form.currentPrice}
            onChange={(e) => set('currentPrice', e.target.value)}
          />
        </Field>
      </div>
      <Field label="% alvo na categoria">
        <input
          className={inputClass}
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={form.targetPercent}
          onChange={(e) => set('targetPercent', e.target.value)}
        />
      </Field>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Categoria</p>
        <div className="flex gap-2 mb-2">
          {(['auto', 'manual'] as const).map((m) => (
            <button
              key={m}
              onClick={() => set('autoCategory', m === 'auto' ? 'true' : 'false')}
              className={cn(
                'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                (m === 'auto') === form.autoCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'auto' ? 'Automático' : 'Manual'}
            </button>
          ))}
        </div>
        {form.autoCategory ? (
          <p className="text-xs px-3 py-2 rounded-md bg-muted text-muted-foreground">
            Detectada: <span className="text-foreground font-medium">{resolvedCatName}</span>
          </p>
        ) : (
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={() =>
          canSave &&
          onSave({
            ticker: form.ticker.trim().toUpperCase(),
            name: form.name.trim(),
            type,
            categoryId: resolvedCatId,
            quantity: Number.parseFloat(form.quantity) || 0,
            avgPrice: Number.parseFloat(form.avgPrice) || 0,
            currentPrice: Number.parseFloat(form.currentPrice) || 0,
            targetPercent: Number.parseFloat(form.targetPercent) || 0,
          })
        }
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  )
}
