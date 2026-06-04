import type { PortfolioCategory } from '@/types'
import { ALL } from '../../../../constants'

interface Props {
  filterCatId: string | typeof ALL
  activeCategories: PortfolioCategory[]
  onSetFilterCatId: (id: string | typeof ALL) => void
}

export const FilterBar = ({ filterCatId, activeCategories, onSetFilterCatId }: Props) => (
  <div className="flex flex-wrap gap-2 items-center justify-between">
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSetFilterCatId(ALL)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          filterCatId === ALL
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Todos
      </button>
      {activeCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSetFilterCatId(filterCatId === cat.id ? ALL : cat.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterCatId === cat.id
              ? 'bg-secondary text-secondary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  </div>
)
