import { formatCurrency } from '@/lib/utils'
import type { AssetAllocation } from '../constants'

interface AssetRowProps {
  allocation: AssetAllocation
}

export const AssetRow = ({ allocation }: AssetRowProps) => {
  const {
    asset,
    aporte: assetAporte,
    quantityToBuy,
    recommendedValue,
    valueAfterAporte,
  } = allocation
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 pl-10 text-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{asset.ticker}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
          rec. {formatCurrency(recommendedValue)}
          <span className="mx-1">→</span>
          <span className="text-foreground">após {formatCurrency(valueAfterAporte)}</span>
        </p>
      </div>
      <div className="text-right shrink-0 min-w-20">
        <p className="font-medium text-foreground">{formatCurrency(assetAporte)}</p>
        {asset.currentPrice > 0 && (
          <p className="text-xs text-muted-foreground">
            ~{Math.floor(quantityToBuy)} unid. (
            {formatCurrency(Math.floor(quantityToBuy) * asset.currentPrice)})
          </p>
        )}
      </div>
    </div>
  )
}
