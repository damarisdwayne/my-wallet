import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/ui/sparkline'
import { formatCurrency } from '@/lib/utils'
import type { Asset, FundamentalRecord, FundamentalSnapshot } from '@/types'
import { FII_COMMON, STOCK_INDICATORS } from '../constants'
import type { FiiNumericDef } from '../types'
import { mergeSnapshots } from '../utils'
import { ValuationBadge } from './valuation-section'

export const AssetCompactCard = ({
  asset,
  record,
  isFii,
  onClick,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  isFii: boolean
  onClick: () => void
}) => {
  const snapshots = record?.snapshots ?? []
  const current = mergeSnapshots(snapshots)

  const keyDefs: {
    key: keyof FundamentalSnapshot
    label: string
    format: (v: number) => string
  }[] = isFii
    ? (FII_COMMON.filter(
        (d) => d.key === 'dividendYield' || d.key === 'priceToBook',
      ) as FiiNumericDef[])
    : STOCK_INDICATORS.filter(
        (d) => d.key === 'priceEarnings' || d.key === 'dividendYield' || d.key === 'priceToBook',
      )

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors group"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <span className="font-bold text-foreground">{asset.ticker}</span>
            {asset.name !== asset.ticker && (
              <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
            )}
          </div>
          <ChevronRight
            size={14}
            className="text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors"
          />
        </div>

        <div className="flex items-end justify-between mb-3">
          <p className="text-lg font-bold text-foreground">{formatCurrency(asset.currentPrice)}</p>
          {asset.type !== 'fixed_income' && asset.type !== 'tesouro' && (
            <Sparkline ticker={asset.ticker} width={72} height={28} />
          )}
        </div>

        {keyDefs.length > 0 && current && (
          <div className="flex gap-4">
            {keyDefs.map((def) => {
              const val = current[def.key] as number | null
              if (val == null) return null
              return (
                <div key={def.key as string}>
                  <p className="text-[10px] text-muted-foreground">{def.label}</p>
                  <p className="text-xs font-medium text-foreground">{def.format(val)}</p>
                </div>
              )
            })}
          </div>
        )}

        {snapshots.length === 0 && (
          <p className="text-xs text-muted-foreground/50 italic">Sem indicadores</p>
        )}

        <ValuationBadge currentPrice={asset.currentPrice} snapshot={current} isFii={isFii} />
      </div>
    </Card>
  )
}
