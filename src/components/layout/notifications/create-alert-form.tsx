import { useState } from 'react'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import type { PriceAlert } from '@/types'

type AlertData = Omit<PriceAlert, 'id' | 'createdAt' | 'active'>

type Props = {
  onSubmit: (data: AlertData) => Promise<void>
}

const inputCls =
  'w-full h-9 px-3 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-shadow'

export const CreateAlertForm = ({ onSubmit }: Props) => {
  const [ticker, setTicker] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [condition, setCondition] = useState<'above' | 'below'>('below')
  const [loading, setLoading] = useState(false)

  const isValid = ticker.trim() && !!targetPrice

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    try {
      await onSubmit({
        ticker: ticker.trim().toUpperCase(),
        condition,
        targetPrice: Number.parseFloat(targetPrice),
        channels: ['browser', 'email'],
      })
      setTicker('')
      setTargetPrice('')
      setCondition('below')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="alert-ticker" className="text-xs font-medium text-muted-foreground">
            Ticker
          </label>
          <input
            id="alert-ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="BBAS3"
            autoComplete="off"
            className={`${inputCls} font-semibold uppercase tracking-wider`}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="alert-value" className="text-xs font-medium text-muted-foreground">
            Preço alvo
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium select-none">
              R$
            </span>
            <input
              id="alert-value"
              type="number"
              step="0.01"
              min="0"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0,00"
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>
      </div>

      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setCondition('below')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
            condition === 'below'
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-background text-muted-foreground hover:bg-accent'
          }`}
        >
          <TrendingDown size={14} />
          Cair até o preço
        </button>
        <div className="w-px bg-border" />
        <button
          type="button"
          onClick={() => setCondition('above')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
            condition === 'above'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-background text-muted-foreground hover:bg-accent'
          }`}
        >
          <TrendingUp size={14} />
          Subir até o preço
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || !isValid}
        className="w-full h-9 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={14} />
        {loading ? 'Criando...' : 'Criar alerta'}
      </button>
    </form>
  )
}
