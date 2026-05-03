import { ALL } from '../../../../constants'
import type { PortfolioCategory } from '@/types'
import { formatCurrency } from '@/lib/utils'

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
}: CategoryFilterProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">
        {activeCat ? activeCat.name : 'Patrimônio total'}
      </p>
      <p className="text-2xl font-bold text-foreground">{formatCurrency(filteredTotal)}</p>
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
