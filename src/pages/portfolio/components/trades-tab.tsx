import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Trade } from '@/types'

interface Props {
  trades: Trade[]
}

const tradeLabel = (t: Trade) => {
  if (t.label === 'bonificacao') return 'Bonificação'
  if (t.label === 'amortizacao') return 'Amortização'
  return t.type === 'buy' ? 'Compra' : 'Venda'
}

const tradeColor = (t: Trade) =>
  t.type === 'buy' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'

const sourceLabel = (t: Trade) =>
  t.source === 'b3_import' ? 'B3' : t.source === 'inter_import' ? 'Inter' : 'Manual'

export const TradesTab = ({ trades }: Props) => {
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set())

  const grouped = useMemo(() => {
    const map = new Map<string, Trade[]>()
    for (const t of trades) {
      const list = map.get(t.ticker) ?? []
      list.push(t)
      map.set(t.ticker, list)
    }
    return [...map.entries()]
      .map(([ticker, items]) => {
        const bought = items.filter((t) => t.type === 'buy').reduce((s, t) => s + t.quantity, 0)
        const sold = items.filter((t) => t.type === 'sell').reduce((s, t) => s + t.quantity, 0)
        const totalInvested = items.filter((t) => t.type === 'buy').reduce((s, t) => s + t.total, 0)
        return { ticker, items, bought, sold, totalInvested }
      })
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
  }, [trades])

  const toggle = (ticker: string) =>
    setExpandedTickers((prev) => {
      const next = new Set(prev)
      next.has(ticker) ? next.delete(ticker) : next.add(ticker)
      return next
    })

  if (trades.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Nenhuma movimentação registrada. Importe uma nota B3 ou registre em "Visão Geral".
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {grouped.length} ativo(s) · {trades.length} operação(ões)
      </p>
      <div className="rounded-lg border border-border overflow-hidden">
        {grouped.map(({ ticker, items, bought, sold, totalInvested }, idx) => {
          const isExpanded = expandedTickers.has(ticker)
          return (
            <div key={ticker} className={cn(idx > 0 && 'border-t border-border')}>
              <button
                onClick={() => toggle(ticker)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={cn(
                    'text-muted-foreground shrink-0 transition-transform',
                    isExpanded && 'rotate-180',
                  )}
                />
                <span className="font-semibold text-foreground text-sm w-20 shrink-0">
                  {ticker}
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
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((t) => (
                        <tr
                          key={t.id}
                          className="border-t border-border/60 hover:bg-accent/20 transition-colors"
                        >
                          <td className="px-4 py-2 text-muted-foreground tabular-nums text-xs">
                            {t.date
                              ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')
                              : '—'}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full',
                                tradeColor(t),
                              )}
                            >
                              {tradeLabel(t)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-xs">
                            {t.quantity}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
