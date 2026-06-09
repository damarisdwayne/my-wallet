import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPtaxRate } from '@/services/quotes'
import type { Asset, AssetType, PortfolioCategory } from '@/types'
import { Field } from '../utils'
import { inputClass } from '../constants'

// Ações/ETFs no exterior são cotados em dólar — o formulário coleta o preço em US$ e converte
// por PTAX, guardando avgPriceUsd/currentPriceUsd para o PM em dólar e o IR ficarem corretos.
const isExteriorType = (t: AssetType) => t === 'stock_us' || t === 'etf_us'

export const StandardForm = ({
  type,
  categories,
  onSave,
}: {
  type: AssetType
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const isExterior = isExteriorType(type)
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
  const [usdRate, setUsdRate] = useState('')
  const [rateLoading, setRateLoading] = useState(false)

  // PTAX atual (referência oficial usada pela Receita) para converter os preços em dólar.
  useEffect(() => {
    if (!isExterior) return
    let cancelled = false
    setRateLoading(true)
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
  }, [isExterior])

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const autoCatId = categories.find((c) => c.assetTypes.includes(type))?.id ?? ''
  const resolvedCatId = form.autoCategory ? autoCatId : form.categoryId
  const resolvedCatName = form.autoCategory
    ? (categories.find((c) => c.id === autoCatId)?.name ?? 'Nenhuma encontrada')
    : (categories.find((c) => c.id === form.categoryId)?.name ?? '—')

  const parsedAvg = Number.parseFloat(form.avgPrice) || 0
  const parsedCurrent = Number.parseFloat(form.currentPrice) || 0
  const rate = Number.parseFloat(usdRate) || 0
  const avgPriceBrl = isExterior ? parsedAvg * rate : parsedAvg
  const currentPriceBrl = isExterior ? parsedCurrent * rate : parsedCurrent
  const cur = isExterior ? 'US$' : 'R$'

  const canSave = !!(form.ticker.trim() && form.name.trim() && (!isExterior || rate > 0))

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Ticker">
          <input
            className={inputClass}
            placeholder={isExterior ? 'AAPL' : 'PETR4'}
            value={form.ticker}
            onChange={(e) => set('ticker', e.target.value)}
          />
        </Field>
        <Field label="Nome">
          <input
            className={inputClass}
            placeholder={isExterior ? 'Apple Inc.' : 'Petrobras PN'}
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
            step="any"
            placeholder="100"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </Field>
        <Field label={`PM (${cur})`}>
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder={isExterior ? '180.00' : '30.00'}
            value={form.avgPrice}
            onChange={(e) => set('avgPrice', e.target.value)}
          />
        </Field>
        <Field label={`Atual (${cur})`} className="col-span-2 sm:col-span-1">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder={isExterior ? '195.00' : '35.00'}
            value={form.currentPrice}
            onChange={(e) => set('currentPrice', e.target.value)}
          />
        </Field>
      </div>
      {isExterior && (
        <div className="grid grid-cols-2 gap-2">
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
          {parsedAvg > 0 && rate > 0 && (
            <p className="text-xs text-muted-foreground self-end pb-2">
              PM: R${' '}
              {avgPriceBrl.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
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
            quantity: Number.parseFloat(form.quantity) || 0,
            avgPrice: avgPriceBrl,
            avgPriceUsd: isExterior && parsedAvg > 0 ? parsedAvg : undefined,
            currentPrice: currentPriceBrl,
            currentPriceUsd: isExterior && parsedCurrent > 0 ? parsedCurrent : undefined,
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
