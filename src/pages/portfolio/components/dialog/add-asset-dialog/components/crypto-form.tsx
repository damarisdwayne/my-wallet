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
  const cryptoCatId = categories.find((c) => c.assetTypes.includes('crypto'))?.id ?? ''
  const [ticker, setTicker] = useState('')
  const [customTicker, setCustomTicker] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [currency, setCurrency] = useState<'BRL' | 'USD'>('USD')
  const [avgPrice, setAvgPrice] = useState('')
  const [usdRate, setUsdRate] = useState('')
  const [categoryId, setCategoryId] = useState(cryptoCatId)

  const resolvedTicker = isCustom ? customTicker.toUpperCase() : ticker
  const resolvedName = isCustom
    ? customTicker
    : (KNOWN_CRYPTOS.find((c) => c.ticker === ticker)?.name ?? ticker)
  const parsedAvg = Number.parseFloat(avgPrice)
  const parsedRate = Number.parseFloat(usdRate)
  const avgPriceBrl =
    currency === 'USD' && parsedAvg > 0 && parsedRate > 0 ? parsedAvg * parsedRate : parsedAvg
  const canSave =
    resolvedTicker &&
    Number.parseFloat(quantity) > 0 &&
    parsedAvg > 0 &&
    (currency === 'BRL' || parsedRate > 0)

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
        <Field label="Preço médio">
          <div className={cn(inputClass, 'flex items-center gap-1 p-0 pl-3 pr-1 overflow-hidden')}>
            <input
              className="flex-1 bg-transparent outline-none border-0 text-sm h-full min-w-0"
              type="number"
              min={0}
              step="any"
              placeholder={currency === 'USD' ? '84518.68' : '350000'}
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'BRL' | 'USD')}
              className="bg-muted/50 rounded text-xs font-medium px-1.5 py-1 border-0 outline-none cursor-pointer text-foreground"
            >
              <option value="USD">$</option>
              <option value="BRL">R$</option>
            </select>
          </div>
        </Field>
      </div>
      {currency === 'USD' && (
        <Field label="Cotação USD/BRL na compra">
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="ex: 5.40"
            value={usdRate}
            onChange={(e) => setUsdRate(e.target.value)}
          />
          {parsedAvg > 0 && parsedRate > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              PM convertido: R$ {avgPriceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </Field>
      )}
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
            avgPrice: avgPriceBrl,
            currentPrice: avgPriceBrl,
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
