import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { SaleItem } from '@/types'
import { formatMonthLabel, saleCategories } from '../utils'

interface SoldListProps {
  items: (SaleItem & { soldAt: string })[]
  selectedMonth: string
  onDelete: (id: string) => void
}

export const SoldList = ({ items, selectedMonth, onDelete }: SoldListProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Vendidos — {formatMonthLabel(selectedMonth)}</CardTitle>
        <span className="text-xs text-muted-foreground">{items.length} registros</span>
      </div>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma venda registrada neste mês.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const profit = (item.sellPrice ?? 0) - item.buyPrice
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="secondary">{saleCategories[item.category]}</Badge>
                  <div className="min-w-0">
                    <span className="text-sm text-foreground">{item.name}</span>
                    {item.notes && (
                      <p className="text-[10px] text-muted-foreground truncate">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(item.buyPrice)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(item.sellPrice ?? 0)}
                    </span>
                  </div>
                  <Badge variant={profit >= 0 ? 'success' : 'destructive'}>
                    {profit >= 0 ? '+' : ''}
                    {formatCurrency(profit)}
                  </Badge>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </CardContent>
  </Card>
)
