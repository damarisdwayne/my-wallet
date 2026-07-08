import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPtaxRate } from '@/services/quotes'
import type { Asset, AssetType, PortfolioCategory } from '@/types'
import { Field } from '../utils'
import { inputClass } from '../constants'

// Ações/ETFs no exterior são cotados em dólar. Aqui não há PM: a compra é feita ao preço atual.
// O usuário informa o preço do ativo e o valor (US$) que vai investir; a quantidade é derivada
// (valor / preço). Guardamos avgPriceUsd/currentPriceUsd para o PM em dólar e o IR ficarem corretos.
export const ExteriorForm = ({
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
    currentPrice: '',
    investUsd: '',
    targetPercent: '10',
    categoryId: '',
    autoCategory: true,
  })
  const [usdRate, setUsdRate] = useState('')
  const [rateLoading, setRateLoading] = useState(true)

  // PTAX atual (referência oficial usada pela Receita) para converter os preços em dólar.
  useEffect(() => {
    let cancelled = false
    fetchPtaxRate()
      .then((rate) => {
        if (!cancelled && rate > 0) setUsdRate(rate.toFixed(4))
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const autoCatId = categories.find((c) => c.assetTypes.includes(type))?.id ?? ''
  const resolvedCatId = form.autoCategory ? autoCatId : form.categoryId
  const resolvedCatName = form.autoCategory
    ? (categories.find((c) => c.id === autoCatId)?.name ?? 'Nenhuma encontrada')
    : (categories.find((c) => c.id === form.categoryId)?.name ?? '—')

  const price = Number.parseFloat(form.currentPrice) || 0
  const investUsd = Number.parseFloat(form.investUsd) || 0
  const rate = Number.parseFloat(usdRate) || 0
  const quantity = price > 0 ? investUsd / price : 0
  const priceBrl = price * rate

  const canSave = !!(
    form.ticker.trim() &&
    form.name.trim() &&
    price > 0 &&
    quantity > 0 &&
    rate > 0
  )

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Ticker">
          <input
            className={inputClass}
            placeholder="AAPL"
            value={form.ticker}
            onChange={(e) => set('ticker', e.target.value)}
          />
        </Field>
        <Field label="Nome">
          <input
            className={inputClass}
            placeholder="Apple Inc."
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Preço atual (US$)">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="195.00"
            value={form.currentPrice}
            onChange={(e) => set('currentPrice', e.target.value)}
          />
        </Field>
        <Field
          label={
            <span className="flex items-center gap-1">
              Cotação USD/BRL
              {rateLoading && <Loader2 size={11} className="animate-spin" />}
            </span>
          }
        >
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="ex: 5.40"
            value={usdRate}
            onChange={(e) => setUsdRate(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Valor a investir (US$)">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="1000.00"
            value={form.investUsd}
            onChange={(e) => set('investUsd', e.target.value)}
          />
        </Field>
        <Field label="Quantidade">
          <div className={cn(inputClass, 'flex items-center bg-muted text-muted-foreground')}>
            {quantity > 0 ? quantity.toLocaleString('pt-BR', { maximumFractionDigits: 6 }) : '—'}
          </div>
        </Field>
      </div>
      {quantity > 0 && rate > 0 && (
        <p className="text-xs text-muted-foreground">
          ≈ R${' '}
          {(investUsd * rate).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          · preço R${' '}
          {priceBrl.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      )}
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
            quantity,
            // Sem PM: compra ao preço atual em dólar.
            avgPrice: priceBrl,
            avgPriceUsd: price,
            currentPrice: priceBrl,
            currentPriceUsd: price,
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
