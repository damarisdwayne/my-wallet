import { useMemo, useState } from 'react'
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

export const TradesTab = ({ trades }: Props) => {
  const [filterTicker, setFilterTicker] = useState('')

  const tickers = useMemo(
    () => [...new Set(trades.map((t) => t.ticker))].sort((a, b) => a.localeCompare(b)),
    [trades],
  )

  const filtered = useMemo(
    () => (filterTicker ? trades.filter((t) => t.ticker === filterTicker) : trades),
    [trades, filterTicker],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={filterTicker}
          onChange={(e) => setFilterTicker(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos os ativos</option>
          {tickers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">{filtered.length} operação(ões)</span>
      </div>

      {trades.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Nenhuma movimentação registrada. Importe uma nota B3 ou registre manualmente em "Visão
          Geral".
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground bg-muted/40">
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Ativo</th>
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium text-right">Qtd</th>
                <th className="px-4 py-2.5 font-medium text-right">Preço</th>
                <th className="px-4 py-2.5 font-medium text-right">Total</th>
                <th className="px-4 py-2.5 font-medium text-right">Origem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-border hover:bg-accent/20 transition-colors"
                >
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    {t.date ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{t.ticker}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn('text-xs font-medium px-2 py-0.5 rounded-full', tradeColor(t))}
                    >
                      {tradeLabel(t)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                    {t.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                    {t.price > 0 ? formatCurrency(t.price) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-foreground tabular-nums">
                    {t.total > 0 ? formatCurrency(t.total) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                    {t.source === 'b3_import'
                      ? 'B3'
                      : t.source === 'inter_import'
                        ? 'Inter'
                        : 'Manual'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
