import { ALL } from '../../../../constants'
import type { PortfolioCategory } from '@/types'
import { MASK, usePrivacy } from '@/store/privacy'
import { useDisplayCurrency } from '@/store/display-currency'

interface CategoryFilterProps {
  activeCat: PortfolioCategory | null
  filteredTotal: number
  totalValue: number
  activeCategories: PortfolioCategory[]
  filterCatId: string | typeof ALL
  onSetFilterCatId: (id: string | typeof ALL) => void
}

export const CategoryFilter = ({
  activeCat,
  filteredTotal,
  totalValue,
  activeCategories,
  filterCatId,
  onSetFilterCatId,
}: CategoryFilterProps) => {
  const { hideValues } = usePrivacy()
  const { displayUsd, toggleDisplayUsd, usdRate, canShowUsd, fmt } = useDisplayCurrency()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">
          {activeCat ? activeCat.name : 'Patrimônio total'}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-foreground">
            {hideValues ? MASK : fmt(filteredTotal)}
          </p>
          {canShowUsd && !hideValues && (
            <button
              onClick={toggleDisplayUsd}
              title={displayUsd ? 'Ver em R$' : `Ver em US$ (cotação R$ ${usdRate.toFixed(2)})`}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                displayUsd
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {displayUsd ? 'R$' : '$'}
            </button>
          )}
        </div>
        {activeCat && (
          <p className="text-xs text-muted-foreground">
            {((filteredTotal / totalValue) * 100).toFixed(1)}% da carteira
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSetFilterCatId(ALL)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterCatId === ALL
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSetFilterCatId(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterCatId === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
