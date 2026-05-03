import type { PortfolioCategory } from '@/types'
import { ALL } from '../../../../constants'

interface Props {
  filterCatId: string | typeof ALL
  activeCategories: PortfolioCategory[]
  syncing: boolean
  onSetFilterCatId: (id: string | typeof ALL) => void
  onSync: () => void
}

export const FilterBar = ({
  filterCatId,
  activeCategories,
  syncing,
  onSetFilterCatId,
  onSync,
}: Props) => (
  <div className="flex flex-wrap gap-2 items-center justify-between">
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
          onClick={() => onSetFilterCatId(filterCatId === cat.id ? ALL : cat.id)}
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
    <button
      onClick={onSync}
      disabled={syncing}
      className="px-3 py-1 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 shrink-0"
    >
      {syncing ? 'Sincronizando...' : 'Sincronizar ativos'}
    </button>
  </div>
)
