import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { formatMonthLabel } from '../utils'

interface MonthPoint {
  month: string
  profit: number
}

interface MonthlyChartProps {
  data: MonthPoint[]
  selectedMonth: string
  maxValue: number
  onSelectMonth: (month: string) => void
}

export const MonthlyChart = ({
  data,
  selectedMonth,
  maxValue,
  onSelectMonth,
}: MonthlyChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Histórico mensal</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-end gap-2 h-28">
        {data.map((h) => {
          const pct = (Math.abs(h.profit) / maxValue) * 100
          const isSelected = h.month === selectedMonth
          const isPositive = h.profit >= 0
          return (
            <button
              key={h.month}
              onClick={() => onSelectMonth(h.month)}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={formatCurrency(h.profit)}
            >
              <span
                className={`text-[10px] font-medium transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {formatCurrency(h.profit)}
              </span>
              <div
                className={`w-full rounded-t transition-colors ${
                  isSelected
                    ? isPositive
                      ? 'bg-primary'
                      : 'bg-destructive'
                    : isPositive
                      ? 'bg-primary/30 group-hover:bg-primary/50'
                      : 'bg-destructive/30 group-hover:bg-destructive/50'
                }`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              <span
                className={`text-[10px] transition-colors ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {formatMonthLabel(h.month)}
              </span>
            </button>
          )
        })}
      </div>
    </CardContent>
  </Card>
)
