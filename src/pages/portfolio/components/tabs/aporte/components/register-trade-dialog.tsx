import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { fetchPtaxRateForDate } from '@/services/quotes'
import type { Asset, Trade } from '@/types'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const todayStr = new Date().toISOString().slice(0, 10)

// Cripto e exterior são cotados em dólar — o trade precisa carregar priceUsd/totalUsd/usdRateAtTrade
// para o PM em USD e o IR (custo em dólar) ficarem corretos.
const isUsdType = (t: Asset['type']) => t === 'crypto' || t === 'stock_us' || t === 'etf_us'

interface Props {
  asset: Asset
  defaultQuantity: number
  onClose: () => void
  onConfirm: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
}

// Pré-preenche com a quantidade recomendada e o preço atual, ambos editáveis —
// o preço no momento da compra pode diferir do preço usado na simulação.
export const RegisterTradeDialog = ({ asset, defaultQuantity, onClose, onConfirm }: Props) => {
  const usdMode = isUsdType(asset.type) && asset.currentPriceUsd != null
  const initialPrice = usdMode ? (asset.currentPriceUsd ?? 0) : asset.currentPrice

  // Arredonda pra no máximo 8 casas (cripto) e remove zeros à direita; inteiros ficam inteiros.
  const [quantity, setQuantity] = useState(
    defaultQuantity > 0 ? String(Number(defaultQuantity.toFixed(8))) : '',
  )
  const [price, setPrice] = useState(initialPrice > 0 ? String(initialPrice) : '')
  const [date, setDate] = useState(todayStr)
  const [usdRate, setUsdRate] = useState('')
  const [rateLoading, setRateLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // PTAX da data (mesma referência usada no IR e nas importações) para converter o preço em dólar.
  useEffect(() => {
    if (!usdMode || !date) return
    let cancelled = false
    setRateLoading(true)
    fetchPtaxRateForDate(date)
      .then((rate) => {
        if (!cancelled && rate > 0) setUsdRate(rate.toFixed(4))
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [usdMode, date])

  const qty = Number(quantity) || 0
  const prc = Number(price) || 0
  const rate = Number(usdRate) || 0
  const priceBrl = usdMode ? prc * rate : prc
  const totalBrl = qty * priceBrl
  const canSave = qty > 0 && prc > 0 && (!usdMode || rate > 0)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const base = {
        ticker: asset.ticker.toUpperCase(),
        type: 'buy' as const,
        quantity: qty,
        price: priceBrl,
        total: totalBrl,
        date,
      }
      await onConfirm(
        usdMode ? { ...base, priceUsd: prc, totalUsd: qty * prc, usdRateAtTrade: rate } : base,
      )
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Lançar compra — {asset.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rt-qty" className="text-xs text-muted-foreground mb-1 block">
                Quantidade
              </label>
              <input
                id="rt-qty"
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="rt-price" className="text-xs text-muted-foreground mb-1 block">
                Preço ({usdMode ? 'US$' : 'R$'})
              </label>
              <input
                id="rt-price"
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rt-date" className="text-xs text-muted-foreground mb-1 block">
                Data
              </label>
              <input
                id="rt-date"
                type="date"
                max={todayStr}
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {usdMode && (
              <div>
                <label
                  htmlFor="rt-rate"
                  className="text-xs text-muted-foreground mb-1 flex items-center gap-1"
                >
                  Cotação USD/BRL
                  {rateLoading && <Loader2 size={11} className="animate-spin" />}
                </label>
                <input
                  id="rt-rate"
                  type="number"
                  min="0"
                  step="any"
                  className={inputClass}
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(totalBrl)}</span>
            {usdMode && prc > 0 && (
              <> · US$ {(qty * prc).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>
            )}{' '}
            · a posição e o PM são atualizados ao lançar.
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
            disabled={saving || !canSave}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Lançando...' : 'Lançar compra'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
