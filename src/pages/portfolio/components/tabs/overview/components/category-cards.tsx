import { ALL } from '../../../../constants'
import type { PortfolioCategory } from '@/types'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

interface CategoryCardsProps {
  activeCategories: PortfolioCategory[]
  valueByCat: Record<string, number>
  totalValue: number
  filterCatId: string | typeof ALL
  onSetFilterCatId: (id: string | typeof ALL) => void
}

export const CategoryCards = ({
  activeCategories,
  valueByCat,
  totalValue,
  filterCatId,
  onSetFilterCatId,
}: CategoryCardsProps) => {
  const { hideValues } = usePrivacy()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {activeCategories.map((cat) => {
        const val = valueByCat[cat.id] ?? 0
        const pct = (val / totalValue) * 100
        const isActive = filterCatId === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSetFilterCatId(filterCatId === cat.id ? ALL : cat.id)}
            className="text-left"
          >
            <Card
              className={`transition-colors ${isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <CardTitle>{cat.name}</CardTitle>
                </div>
                <p className="text-base font-bold text-foreground mt-1">
                  {hideValues ? MASK : formatCurrency(val)}
                </p>
                <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% da carteira</p>
              </CardHeader>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
