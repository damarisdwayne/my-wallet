import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { formatCurrency, formatDate, getDividendBrl, getDividendIrBrl } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import type { Dividend } from '@/types'

const PAGE_SIZE = 10

type Props = {
  yearDividends: Dividend[]
  yearTotal: number
  selectedYear: string
  years: string[]
  usdRate: number
  onSelectYear: (year: string) => void
  onDelete: (id: string) => void
}

export const DividendsList = ({
  yearDividends,
  yearTotal,
  selectedYear,
  years,
  usdRate,
  onSelectYear,
  onDelete,
}: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? yearDividends : yearDividends.slice(0, PAGE_SIZE)
  const hidden = yearDividends.length - PAGE_SIZE

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <CardTitle>Histórico</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => {
                  onSelectYear(y)
                  setShowAll(false)
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedYear === y ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        {yearDividends.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Total em {selectedYear}:{' '}
            <span className="font-semibold text-foreground">{fmt(yearTotal)}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {yearDividends.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum provento em {selectedYear}.
          </p>
        ) : (
          <div>
            {visible.map((d) => (
              <div
                key={d.id}
                className="group flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/20 -mx-1 px-1 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-foreground w-20">{d.ticker}</span>
                  <Badge
                    variant={
                      d.type === 'rendimento'
                        ? 'default'
                        : d.type === 'jcp'
                          ? 'warning'
                          : d.type === 'dividendo_ext'
                            ? 'secondary'
                            : 'success'
                    }
                  >
                    {d.type === 'dividendo_ext' ? 'DIVIDENDO EXT' : d.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  {getDividendIrBrl(d, usdRate) > 0 && (
                    <span className="text-xs text-muted-foreground">
                      IR: {fmt(getDividendIrBrl(d, usdRate))}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatDate(d.paymentDate)}
                  </span>
                  <span className="text-sm font-semibold text-success">
                    +{fmt(getDividendBrl(d, usdRate))}
                  </span>
                  <button
                    onClick={() => onDelete(d.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {!showAll && hidden > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver mais {hidden} {hidden === 1 ? 'registro' : 'registros'}
              </button>
            )}
            {showAll && yearDividends.length > PAGE_SIZE && (
              <button
                onClick={() => setShowAll(false)}
                className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver menos
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
