import { ChevronDown, Trash2 } from 'lucide-react'
import { cn, formatCurrency, formatDate, getDividendBrl, getDividendIrBrl } from '@/lib/utils'
import type { Dividend } from '@/types'
import { TradeMoney } from '../trade-money'
import { dividendColor, dividendLabel, dividendSourceLabel } from './utils'

interface Props {
  ticker: string
  items: Dividend[]
  total: number
  totalUsd?: number
  usdRate: number
  isExpanded: boolean
  onToggle: (ticker: string) => void
  onDelete: (id: string) => void
}

export const DividendTickerRow = ({
  ticker,
  items,
  total,
  totalUsd,
  usdRate,
  isExpanded,
  onToggle,
  onDelete,
}: Props) => (
  <>
    <button
      type="button"
      onClick={() => onToggle(ticker)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
    >
      <ChevronDown
        size={14}
        className={cn(
          'text-muted-foreground shrink-0 transition-transform',
          isExpanded && 'rotate-180',
        )}
      />
      <span className="font-semibold text-foreground text-sm shrink-0 w-20">{ticker}</span>
      <span className="text-xs text-muted-foreground">{items.length} provento(s)</span>
      <TradeMoney
        brl={total}
        usd={totalUsd}
        className="text-xs text-success ml-auto tabular-nums"
      />
    </button>

    {isExpanded && (
      <div className="border-t border-border">
        {/* Mobile: card list */}
        <div className="md:hidden divide-y divide-border/60">
          {items.map((d) => (
            <div key={d.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(d.paymentDate)}
                  </span>
                  <span
                    className={cn('text-xs font-medium px-2 py-0.5 rounded-full', dividendColor(d))}
                  >
                    {dividendLabel(d)}
                  </span>
                </div>
                {getDividendIrBrl(d, usdRate) > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    IR: {formatCurrency(getDividendIrBrl(d, usdRate))}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TradeMoney
                  brl={getDividendBrl(d, usdRate)}
                  usd={d.amountUsd}
                  className="text-xs font-medium text-success tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => onDelete(d.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Remover provento"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <table className="hidden md:table w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground bg-muted/30">
              <th className="px-4 py-2 font-medium text-xs">Pagamento</th>
              <th className="px-4 py-2 font-medium text-xs">Tipo</th>
              <th className="px-4 py-2 font-medium text-xs text-right">Valor</th>
              <th className="px-4 py-2 font-medium text-xs text-right">IR</th>
              <th className="px-4 py-2 font-medium text-xs text-right">Origem</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr
                key={d.id}
                className="border-t border-border/60 hover:bg-accent/20 transition-colors"
              >
                <td className="px-4 py-2 text-muted-foreground tabular-nums text-xs">
                  {formatDate(d.paymentDate)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={cn('text-xs font-medium px-2 py-0.5 rounded-full', dividendColor(d))}
                  >
                    {dividendLabel(d)}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-xs font-medium text-success">
                  <TradeMoney brl={getDividendBrl(d, usdRate)} usd={d.amountUsd} />
                </td>
                <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                  <TradeMoney brl={getDividendIrBrl(d, usdRate)} usd={d.irUsd} />
                </td>
                <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                  {dividendSourceLabel(d)}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(d.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Remover provento"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
)
