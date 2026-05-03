import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Asset, PortfolioCategory } from '@/types'
import { Field } from '../utils'
import { inputClass, KNOWN_CRYPTOS } from '../constants'

export const CryptoForm = ({
  categories,
  onSave,
}: {
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const cryptoCatId = categories.find((c) => c.type === 'crypto')?.id ?? ''
  const [ticker, setTicker] = useState('')
  const [customTicker, setCustomTicker] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [categoryId, setCategoryId] = useState(cryptoCatId)

  const resolvedTicker = isCustom ? customTicker.toUpperCase() : ticker
  const resolvedName = isCustom
    ? customTicker
    : (KNOWN_CRYPTOS.find((c) => c.ticker === ticker)?.name ?? ticker)
  const canSave =
    resolvedTicker && Number.parseFloat(quantity) > 0 && Number.parseFloat(avgPrice) > 0

  return (
    <div className="space-y-3 mt-2">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Criptomoeda</p>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {KNOWN_CRYPTOS.map((c) => (
            <button
              key={c.ticker}
              onClick={() => {
                setIsCustom(false)
                setTicker(c.ticker)
              }}
              className={cn(
                'py-1.5 px-1 rounded-md text-xs font-medium border transition-colors text-left',
                !isCustom && ticker === c.ticker
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
              )}
            >
              <span className="font-bold block">{c.ticker}</span>
              <span className="text-[10px] truncate block">{c.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setIsCustom(true)
              setTicker('')
            }}
            className={cn(
              'py-1.5 px-1 rounded-md text-xs font-medium border transition-colors',
              isCustom
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="font-bold block">Outro</span>
            <span className="text-[10px] block">manual</span>
          </button>
        </div>
        {isCustom && (
          <input
            className={inputClass}
            placeholder="DOGE, SHIB..."
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value)}
            autoFocus
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Quantidade">
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="0.5"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Field>
        <Field label="PM em R$">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="350000"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Categoria">
        <select
          className={inputClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <button
        onClick={() =>
          canSave &&
          onSave({
            ticker: resolvedTicker,
            name: resolvedName,
            type: 'crypto',
            categoryId,
            quantity: Number.parseFloat(quantity),
            avgPrice: Number.parseFloat(avgPrice),
            currentPrice: Number.parseFloat(avgPrice),
            targetPercent: 0,
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
