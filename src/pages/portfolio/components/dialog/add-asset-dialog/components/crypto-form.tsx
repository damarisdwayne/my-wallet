import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Asset, PortfolioCategory } from '@/types'
import { Field } from '../utils'
import { inputClass, KNOWN_CRYPTOS } from '../constants'

const todayStr = () => new Date().toISOString().slice(0, 10)

// Preço histórico de cripto via CoinGecko (USD na data).
// Endpoint /coins/{id}/history retorna o preço naquela data.
const fetchCryptoPriceForDate = async (
  coingeckoId: string,
  isoDate: string,
): Promise<number | null> => {
  // CoinGecko espera DD-MM-YYYY
  const [y, m, d] = isoDate.split('-')
  const date = `${d}-${m}-${y}`
  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/history?date=${date}&localization=false`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = (await res.json()) as { market_data?: { current_price?: { usd?: number } } }
    const price = json.market_data?.current_price?.usd
    return typeof price === 'number' && price > 0 ? price : null
  } catch {
    return null
  }
}

const fetchPtaxForDate = async (isoDate: string): Promise<number | null> => {
  // BCB PTAX venda (série 10813) — referência oficial usada pela Receita Federal.
  // Janela de 10 dias até a data para cobrir fins de semana/feriados.
  const to = new Date(isoDate)
  const from = new Date(to)
  from.setDate(from.getDate() - 10)
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?formato=json&dataInicial=${fmt(from)}&dataFinal=${fmt(to)}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = (await res.json()) as Array<{ data: string; valor: string }>
    if (!Array.isArray(json) || json.length === 0) return null
    const last = json.at(-1)
    const rate = Number.parseFloat(last?.valor ?? '0')
    return rate > 0 ? rate : null
  } catch {
    return null
  }
}

export const CryptoForm = ({
  categories,
  onSave,
}: {
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const cryptoCatId = categories.find((c) => c.assetTypes.includes('crypto'))?.id ?? ''
  const [ticker, setTicker] = useState('BTC')
  const [customTicker, setCustomTicker] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [currency, setCurrency] = useState<'BRL' | 'USD'>('USD')
  const [avgPrice, setAvgPrice] = useState('')
  const [usdRate, setUsdRate] = useState('')
  const [rateLoading, setRateLoading] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const [purchaseDate, setPurchaseDate] = useState(todayStr())
  const [categoryId, setCategoryId] = useState(cryptoCatId)

  useEffect(() => {
    if (currency !== 'USD' || !purchaseDate) return
    let cancelled = false
    setRateLoading(true)
    fetchPtaxForDate(purchaseDate)
      .then((rate) => {
        if (cancelled || rate === null) return
        setUsdRate(rate.toFixed(4))
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currency, purchaseDate])

  // Auto-fetch crypto price (USD) via CoinGecko quando ticker e data estiverem definidos.
  useEffect(() => {
    if (currency !== 'USD' || !purchaseDate || isCustom || !ticker) return
    const coingeckoId = KNOWN_CRYPTOS.find((c) => c.ticker === ticker)?.coingeckoId
    if (!coingeckoId) return
    let cancelled = false
    setPriceLoading(true)
    fetchCryptoPriceForDate(coingeckoId, purchaseDate)
      .then((price) => {
        if (cancelled || price === null) return
        setAvgPrice(price.toFixed(2))
      })
      .finally(() => {
        if (!cancelled) setPriceLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currency, purchaseDate, ticker, isCustom])

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
        <Field
          label={
            <span className="flex items-center gap-1">
              Preço médio
              {priceLoading && <Loader2 size={11} className="animate-spin" />}
            </span>
          }
        >
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
      <div className="grid grid-cols-2 gap-2">
        <Field label="Data da compra">
          <input
            className={inputClass}
            type="date"
            value={purchaseDate}
            max={todayStr()}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </Field>
        {currency === 'USD' && (
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
        )}
      </div>
      {currency === 'USD' && parsedAvg > 0 && parsedRate > 0 && (
        <p className="text-xs text-muted-foreground -mt-1">
          PM convertido: R${' '}
          {avgPriceBrl.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
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
            avgPriceUsd: currency === 'USD' && parsedAvg > 0 ? parsedAvg : undefined,
            currentPrice: avgPriceBrl,
            currentPriceUsd: currency === 'USD' && parsedAvg > 0 ? parsedAvg : undefined,
            targetPercent: 0,
            operationDate: purchaseDate,
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
