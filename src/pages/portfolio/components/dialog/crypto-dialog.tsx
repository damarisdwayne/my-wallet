import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Asset } from '@/types'

const KNOWN_CRYPTOS = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'BNB', name: 'BNB' },
  { ticker: 'ADA', name: 'Cardano' },
  { ticker: 'XRP', name: 'XRP' },
  { ticker: 'DOT', name: 'Polkadot' },
  { ticker: 'AVAX', name: 'Avalanche' },
  { ticker: 'MATIC', name: 'Polygon' },
  { ticker: 'LINK', name: 'Chainlink' },
  { ticker: 'UNI', name: 'Uniswap' },
  { ticker: 'ATOM', name: 'Cosmos' },
]

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: { id: string; name: string }[]
  onAdd: (asset: Asset) => Promise<void>
}

const empty = () => ({
  ticker: '',
  customTicker: '',
  quantity: '',
  avgPriceBrl: '',
  categoryId: '',
})

export const CryptoDialog = ({ open, onOpenChange, categories, onAdd }: Props) => {
  const [form, setForm] = useState(empty())
  const [isCustom, setIsCustom] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const selectedCrypto = KNOWN_CRYPTOS.find((c) => c.ticker === form.ticker)
  const ticker = isCustom ? form.customTicker.toUpperCase() : form.ticker
  const name = isCustom ? form.customTicker : (selectedCrypto?.name ?? form.ticker)

  const handleSave = async () => {
    const qty = Number.parseFloat(form.quantity)
    const avgPrice = Number.parseFloat(form.avgPriceBrl)
    if (!ticker || qty <= 0 || avgPrice <= 0) return
    setSaving(true)
    try {
      const asset: Asset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ticker,
        name,
        type: 'crypto',
        categoryId: form.categoryId,
        quantity: qty,
        avgPrice,
        currentPrice: avgPrice,
        targetPercent: 0,
      }
      await onAdd(asset)
      setForm(empty())
      setIsCustom(false)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          setForm(empty())
          setIsCustom(false)
        }
      }}
    >
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Criptomoeda</DialogTitle>
          <DialogDescription>
            O preço atual será buscado automaticamente via CoinGecko após salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Criptomoeda</label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {KNOWN_CRYPTOS.map((c) => (
                <button
                  key={c.ticker}
                  onClick={() => {
                    setIsCustom(false)
                    set('ticker', c.ticker)
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors text-left ${
                    !isCustom && form.ticker === c.ticker
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  <span className="font-bold">{c.ticker}</span>
                  <span className="block text-[10px] truncate">{c.name}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setIsCustom(true)
                  set('ticker', '')
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors ${
                  isCustom
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span className="font-bold">Outro</span>
                <span className="block text-[10px]">personalizado</span>
              </button>
            </div>
            {isCustom && (
              <input
                className={inputClass}
                placeholder="Ex: DOGE, SHIB..."
                value={form.customTicker}
                onChange={(e) => set('customTicker', e.target.value)}
                autoFocus
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step="any"
                placeholder="0.5"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">PM em R$</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step={0.01}
                placeholder="350000"
                value={form.avgPriceBrl}
                onChange={(e) => set('avgPriceBrl', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
            <select
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {ticker && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              Ticker CoinGecko: <span className="font-medium text-foreground">{ticker}</span>
              {!KNOWN_CRYPTOS.find((c) => c.ticker === ticker) && (
                <span className="block mt-0.5 text-warning">
                  ⚠ Ticker não mapeado — preço automático pode não funcionar.
                </span>
              )}
            </p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!ticker || !form.quantity || !form.avgPriceBrl || saving}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
