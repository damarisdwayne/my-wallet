import { useMemo, useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Asset, PortfolioCategory, Trade } from '@/types'
import { ALL } from '../constants'

interface Props {
  trades: Trade[]
  assets: Asset[]
  categories: PortfolioCategory[]
  onDeleteTrade: (tradeId: string) => Promise<void>
  onSyncMissingTrades: () => Promise<void>
}

const tradeLabel = (t: Trade) => {
  if (t.label === 'bonificacao') return 'Bonificação'
  if (t.label === 'amortizacao') return 'Amortização'
  if (t.label === 'desdobramento') return 'Desdobramento'
  if (t.label === 'grupamento') return 'Grupamento'
  return t.type === 'buy' ? 'Compra' : 'Venda'
}

const tradeColor = (t: Trade) =>
  t.type === 'buy' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'

const sourceLabel = (t: Trade) =>
  t.source === 'b3_import' ? 'B3' : t.source === 'inter_import' ? 'Inter' : 'Manual'

export const TradesTab = ({
  trades,
  assets,
  categories,
  onDeleteTrade,
  onSyncMissingTrades,
}: Props) => {
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [filterCatId, setFilterCatId] = useState<string | typeof ALL>(ALL)
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await onSyncMissingTrades()
    } finally {
      setSyncing(false)
    }
  }

  const tickerToCatId = useMemo(
    () => Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a.categoryId])),
    [assets],
  )

  const activeCategories = useMemo(
    () => categories.filter((c) => assets.some((a) => a.categoryId === c.id)),
    [categories, assets],
  )

  const filteredTrades = useMemo(
    () =>
      filterCatId === ALL
        ? trades
        : trades.filter((t) => tickerToCatId[t.ticker.toUpperCase()] === filterCatId),
    [trades, filterCatId, tickerToCatId],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Trade[]>()
    for (const t of filteredTrades) {
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
  }, [filteredTrades])

  const toggle = (ticker: string) =>
    setExpandedTickers((prev) => {
      const next = new Set(prev)
      if (next.has(ticker)) next.delete(ticker)
      else next.add(ticker)
      return next
    })

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-muted-foreground">
          Nenhuma movimentação registrada. Importe uma nota B3 ou registre em "Visão Geral".
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar ativos existentes'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCatId(ALL)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterCatId === ALL
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCatId(filterCatId === cat.id ? ALL : cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCatId === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-3 py-1 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 shrink-0"
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar ativos'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {grouped.length} ativo(s) · {filteredTrades.length} operação(ões)
      </p>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma movimentação nesta categoria.
        </p>
      ) : (
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
