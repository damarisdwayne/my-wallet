import type { PortfolioCategory } from '@/types'

interface Props {
  categories: PortfolioCategory[]
  excludedCatIds: Set<string>
  onToggle: (id: string) => void
}

export const CategoryChips = ({ categories, excludedCatIds, onToggle }: Props) => (
  <div className="flex flex-wrap gap-2">
    {categories.map((cat) => {
      const excluded = excludedCatIds.has(cat.id)
      return (
        <button
          key={cat.id}
          onClick={() => onToggle(cat.id)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            excluded
              ? 'border-border text-muted-foreground bg-transparent opacity-40'
              : 'border-transparent text-background'
          }`}
          style={excluded ? {} : { background: cat.color }}
        >
          {cat.name}
        </button>
      )
    })}
  </div>
)
