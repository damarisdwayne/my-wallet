import { useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { cn, formatCurrency, formatQuantity } from '@/lib/utils'
import type { Asset, Trade } from '@/types'
import { tradeLabel, tradeColor, sourceLabel } from '../utils'

interface Props {
  ticker: string
  items: Trade[]
  bought: number
  sold: number
  totalInvested: number
  isExpanded: boolean
  onToggle: (ticker: string) => void
  onDeleteTrade: (tradeId: string) => Promise<void>
  asset: Asset | undefined
}

export const TickerRow = ({
  ticker,
  items,
  bought,
  sold,
  totalInvested,
  isExpanded,
  onToggle,
  onDeleteTrade,
  asset,
}: Props) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const isFixedIncome = asset?.type === 'fixed_income'
  const displayName = isFixedIncome && asset?.name ? asset.name : ticker

  return (
    <>
      <button
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
        <span
          className={cn(
            'font-semibold text-foreground text-sm shrink-0',
            isFixedIncome ? 'flex-1 truncate' : 'w-20',
          )}
        >
          {displayName}
        </span>
        <span className="text-xs text-muted-foreground">{items.length} op.</span>
        <span className="text-xs text-success ml-2">+{bought}</span>
        {sold > 0 && <span className="text-xs text-destructive">-{sold}</span>}
        <span className="text-xs text-muted-foreground ml-auto">
          {totalInvested > 0 ? formatCurrency(totalInvested) : '—'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground bg-muted/30">
                <th className="px-4 py-2 font-medium text-xs">Data</th>
                <th className="px-4 py-2 font-medium text-xs">Tipo</th>
                <th className="px-4 py-2 font-medium text-xs text-right">Qtd</th>
                <th className="px-4 py-2 font-medium text-xs text-right">Preço</th>
                <th className="px-4 py-2 font-medium text-xs text-right">Total</th>
                <th className="px-4 py-2 font-medium text-xs text-right">Origem</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-border/60 hover:bg-accent/20 transition-colors"
                >
                  <td className="px-4 py-2 text-muted-foreground tabular-nums text-xs">
                    {t.date ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={cn('text-xs font-medium px-2 py-0.5 rounded-full', tradeColor(t))}
                    >
                      {tradeLabel(t)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-xs">
                    {formatQuantity(t.quantity)}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground tabular-nums text-xs">
                    {t.price > 0 ? formatCurrency(t.price) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums text-xs">
                    {t.total > 0 ? formatCurrency(t.total) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                    {sourceLabel(t)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {confirmDeleteId === t.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-destructive">Confirmar?</span>
                        <button
                          onClick={() => {
                            onDeleteTrade(t.id)
                            setConfirmDeleteId(null)
                          }}
                          className="px-1.5 py-0.5 rounded text-xs bg-destructive text-destructive-foreground"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
