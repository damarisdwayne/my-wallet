import { Trash2 } from 'lucide-react'
import { cn, getDividendBrl, getDividendIrBrl } from '@/lib/utils'
import type { Dividend } from '@/types'
import { TradeMoney } from '../trade-money'
import { dividendColor, dividendLabel, dividendSourceLabel } from './utils'

interface Props {
  items: Dividend[]
  usdRate: number
  onDelete: (id: string) => void
}

const COLUMN_WIDTHS = ['24%', '16%', '18%', '18%', '12%', '12%']

const TypeBadge = ({ dividend }: { dividend: Dividend }) => (
  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', dividendColor(dividend))}>
    {dividendLabel(dividend)}
  </span>
)

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
    aria-label="Remover provento"
  >
    <Trash2 size={12} />
  </button>
)

const MiniLabel = ({ children }: { children: string }) => (
  <p className="text-muted-foreground/60 uppercase tracking-wide text-[9px]">{children}</p>
)

export const DividendList = ({ items, usdRate, onDelete }: Props) => (
  <>
    <div className="md:hidden divide-y divide-border/60">
      {items.map((d) => (
        <div key={d.id} className="px-4 py-2.5 hover:bg-accent/20 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">{d.ticker}</span>
              <TypeBadge dividend={d} />
            </div>
            <DeleteButton onClick={() => onDelete(d.id)} />
          </div>
          <div className="mt-1.5 flex items-start justify-between text-xs">
            <div>
              <MiniLabel>Valor</MiniLabel>
              <TradeMoney
                brl={getDividendBrl(d, usdRate)}
                usd={d.amountUsd}
                className="tabular-nums font-medium text-success"
              />
            </div>
            <div>
              <MiniLabel>IR</MiniLabel>
              <TradeMoney
                brl={getDividendIrBrl(d, usdRate)}
                usd={d.irUsd}
                className="tabular-nums text-muted-foreground"
              />
            </div>
            <div>
              <MiniLabel>Origem</MiniLabel>
              <p className="text-muted-foreground">{dividendSourceLabel(d)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <table className="hidden md:table w-full table-fixed text-sm">
      <colgroup>
        {COLUMN_WIDTHS.map((width, i) => (
          <col key={i} style={{ width }} />
        ))}
      </colgroup>
      <thead>
        <tr className="text-left text-muted-foreground bg-muted/30">
          <th className="px-4 py-2 font-medium text-xs">Ativo</th>
          <th className="px-4 py-2 font-medium text-xs">Tipo</th>
          <th className="px-4 py-2 font-medium text-xs text-right">Valor</th>
          <th className="px-4 py-2 font-medium text-xs text-right">IR</th>
          <th className="px-4 py-2 font-medium text-xs text-right">Origem</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody>
        {items.map((d) => (
          <tr key={d.id} className="border-t border-border/60 hover:bg-accent/20 transition-colors">
            <td className="truncate px-4 py-2 text-xs font-semibold text-foreground">{d.ticker}</td>
            <td className="px-4 py-2">
              <TypeBadge dividend={d} />
            </td>
            <td className="px-4 py-2 text-right text-xs font-medium tabular-nums text-success">
              <TradeMoney brl={getDividendBrl(d, usdRate)} usd={d.amountUsd} />
            </td>
            <td className="px-4 py-2 text-right text-xs tabular-nums text-muted-foreground">
              <TradeMoney brl={getDividendIrBrl(d, usdRate)} usd={d.irUsd} />
            </td>
            <td className="px-4 py-2 text-right text-xs text-muted-foreground">
              {dividendSourceLabel(d)}
            </td>
            <td className="px-4 py-2 text-right">
              <DeleteButton onClick={() => onDelete(d.id)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)
