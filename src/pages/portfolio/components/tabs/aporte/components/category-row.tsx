import { ChevronDown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import type { CategoryAllocation } from '../constants'
import { AssetRow } from './asset-row'

interface CategoryRowProps {
  allocation: CategoryAllocation
  isOpen: boolean
  onToggle: () => void
}

export const CategoryRow = ({ allocation, isOpen, onToggle }: CategoryRowProps) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const {
    cat,
    catAporte,
    catRecommendedValue,
    catValueAfterAporte,
    catPercentBefore,
    catPercentAfter,
    assetAllocations,
  } = allocation
  const isFixedIncome = cat.assetTypes.some((t) => t === 'fixed_income' || t === 'tesouro')

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => !isFixedIncome && onToggle()}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 bg-muted/30 text-left transition-colors',
          !isFixedIncome && 'hover:bg-muted/50 cursor-pointer',
          isFixedIncome && 'cursor-default',
        )}
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{cat.name}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
            rec. {fmt(catRecommendedValue)}
            <span className="mx-1">→</span>
            <span className="text-foreground">após {fmt(catValueAfterAporte)}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs shrink-0">
          <span className="text-muted-foreground hidden sm:inline">
            {catPercentBefore.toFixed(1)}%<span className="mx-1">→</span>
            <span className="text-foreground font-medium">{catPercentAfter.toFixed(1)}%</span>
          </span>
          <span className="font-semibold text-foreground text-sm min-w-20 text-right">
            {fmt(catAporte)}
          </span>
          {!isFixedIncome && (
            <ChevronDown
              size={14}
              className={cn('text-muted-foreground transition-transform', isOpen && 'rotate-180')}
            />
          )}
        </div>
      </button>

      {isOpen && assetAllocations.length > 0 && (
        <div className="divide-y divide-border">
          {assetAllocations.map((allocation) => (
            <AssetRow key={allocation.asset.id} allocation={allocation} />
          ))}
        </div>
      )}

      {isOpen && assetAllocations.length === 0 && (
        <p className="px-10 py-2.5 text-xs text-muted-foreground border-t border-border">
          Nenhum ativo elegível nesta categoria (verifique as pontuações no diagrama).
        </p>
      )}
    </div>
  )
}
