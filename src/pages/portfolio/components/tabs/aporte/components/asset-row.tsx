import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import type { Trade } from '@/types'
import type { AssetAllocation } from '../constants'
import { RegisterTradeDialog } from './register-trade-dialog'

interface AssetRowProps {
  allocation: AssetAllocation
  onRegister: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
}

export const AssetRow = ({ allocation, onRegister }: AssetRowProps) => {
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
  const [done, setDone] = useState(false)

  // Cripto compra frações (ex: 0,0577 BTC) — não arredonda; demais ativos são unidades inteiras.
  const isCrypto = asset.type === 'crypto'
  const displayQty = isCrypto ? quantityToBuy : Math.floor(quantityToBuy)

  const handleConfirm = async (trade: Omit<Trade, 'id' | 'source'>) => {
    await onRegister(trade)
    setDone(true)
    toast.success(`${asset.ticker}: compra lançada na carteira`)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 pl-10 text-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{asset.ticker}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
          rec. {fmt(recommendedValue)}
          <span className="mx-1">→</span>
          <span className="text-foreground">após {fmt(valueAfterAporte)}</span>
        </p>
      </div>
      <div className="text-right shrink-0 min-w-20">
        <p className="font-medium text-foreground">{fmt(assetAporte)}</p>
        {asset.currentPrice > 0 && (
          <p className="text-xs text-muted-foreground">
            ~
            {isCrypto
              ? displayQty.toLocaleString('pt-BR', { maximumFractionDigits: 8 })
              : displayQty}{' '}
            unid. ({fmt(displayQty * asset.currentPrice)})
          </p>
        )}
      </div>
      {done ? (
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
