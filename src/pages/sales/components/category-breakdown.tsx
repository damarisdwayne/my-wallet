import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { SaleCategory } from '@/types'
import { saleCategories } from '../utils'

interface CategoryBreakdownProps {
  breakdown: Record<string, { profit: number; count: number }>
}

export const CategoryBreakdown = ({ breakdown }: CategoryBreakdownProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    {Object.entries(breakdown).map(([cat, { profit, count }]) => (
      <Card key={cat} className="text-center">
        <CardHeader className="p-4">
          <CardTitle>{saleCategories[cat as SaleCategory]}</CardTitle>
          <p className={`text-lg font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(profit)}
          </p>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? 'venda' : 'vendas'}
          </p>
        </CardHeader>
      </Card>
    ))}
  </div>
)
