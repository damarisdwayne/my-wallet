import { Pencil, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { SaleItem } from '@/types'
import { saleCategories } from '../utils'

interface StockListProps {
  stock: SaleItem[]
  onSell: (item: SaleItem) => void
  onEdit: (item: SaleItem) => void
  onDelete: (id: string) => void
}

export const StockList = ({ stock, onSell, onEdit, onDelete }: StockListProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={15} className="text-primary" />
          <CardTitle>Em estoque</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {stock.length} {stock.length === 1 ? 'item' : 'itens'}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      {stock.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum item em estoque. Registre uma compra para começar.
        </p>
      ) : (
        <div className="space-y-2">
          {stock.map((item) => (
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
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(item.buyPrice)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(item.boughtAt)}</p>
                </div>
                <button
                  onClick={() => onSell(item)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Vender
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
