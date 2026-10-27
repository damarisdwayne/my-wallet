import { useState } from 'react'
import { Ban, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatUsdCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { Trade } from '@/types'
import type { AssetAllocation } from '../constants'
import { isForeignType } from '../utils'
import { RegisterTradeDialog } from './register-trade-dialog'
import type { LastBuy } from '../last-buy'
import { PriceLabel } from './price-label'
import { PriceSignalBadge } from './price-signal-badge'
import { UsdHint } from './usd-hint'
import { WeeklyVariation } from './weekly-variation'

interface AssetRowProps {
  allocation: AssetAllocation
  onRegister: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
  launched: boolean
  onLaunched: () => void
  onExclude: () => void
  usdRate: number
  lastBuy?: LastBuy
}

export const AssetRow = ({
  allocation,
  onRegister,
  launched,
  onLaunched,
  onExclude,
  usdRate,
  lastBuy,
}: AssetRowProps) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const {
    asset,
    aporte: assetAporte,
    quantityToBuy,
    recommendedValue,
    valueAfterAporte,
  } = allocation
  const [open, setOpen] = useState(false)

  // Cripto e ativos no exterior (stock_us/etf_us) permitem fração (ex: 0,2 ações, 0,0577 BTC) —
  // não arredonda; ativos da B3 são unidades inteiras.
  const isForeign = isForeignType(asset.type)
  const allowsFraction = asset.type === 'crypto' || isForeign
  const fractionDigits = asset.type === 'crypto' ? 8 : 4
  const displayQty = allowsFraction ? quantityToBuy : Math.floor(quantityToBuy)

  // Preço atual na moeda de origem: US$ para ativos do exterior, R$ para os demais.
  const priceUsd = isForeign ? asset.currentPriceUsd : undefined

  const handleConfirm = async (trade: Omit<Trade, 'id' | 'source'>) => {
    await onRegister(trade)
    onLaunched()
    toast.success(`${asset.ticker}: compra lançada na carteira`)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 pl-10 text-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground flex flex-wrap items-center gap-1.5">
          {asset.ticker}
          {asset.currentPrice > 0 && <PriceLabel asset={asset} lastBuy={lastBuy} />}
          <WeeklyVariation asset={asset} />
          <PriceSignalBadge asset={asset} lastBuy={lastBuy} />
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
          rec. {fmt(recommendedValue)}
          <span className="mx-1">→</span>
          <span className="text-foreground">após {fmt(valueAfterAporte)}</span>
        </p>
      </div>
      <div className="text-right shrink-0 min-w-20">
        <p className="font-medium text-foreground">{fmt(assetAporte)}</p>
        {isForeign && <UsdHint brl={assetAporte} usdRate={usdRate} className="block" />}
        {asset.currentPrice > 0 && (
          <p className="text-xs text-muted-foreground">
            ~{displayQty.toLocaleString('pt-BR', { maximumFractionDigits: fractionDigits })} unid. (
            {fmt(displayQty * asset.currentPrice)}
            {priceUsd != null && priceUsd > 0 && !hideValues && (
              <> · {formatUsdCurrency(displayQty * priceUsd)}</>
            )}
            )
          </p>
        )}
      </div>
      {launched ? (
        <span className="flex items-center gap-1 text-xs text-success shrink-0">
          <Check size={14} /> Lançado
        </span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
        >
          <Plus size={14} /> Lançar
        </button>
      )}
      <button
        onClick={onExclude}
        title="Não investir neste ativo agora"
        className="text-muted-foreground/60 hover:text-destructive transition-colors shrink-0"
      >
        <Ban size={14} />
      </button>
      {open && (
        <RegisterTradeDialog
          asset={asset}
          defaultQuantity={displayQty}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
