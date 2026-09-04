import type { PortfolioCategory } from '@/types'

interface Props {
  categories: PortfolioCategory[]
  selectedId: string
  onSelect: (id: string) => void
}

export const CategoryPills = ({ categories, selectedId, onSelect }: Props) => (
  <div className="flex flex-wrap gap-1">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedId === cat.id ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        {cat.name}
      </button>
    ))}
  </div>
)
