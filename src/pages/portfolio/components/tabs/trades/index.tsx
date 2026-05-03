import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Asset, PortfolioCategory, Trade } from '@/types'
import { ALL } from '../../../constants'
import { FilterBar, TickerRow } from './components'

interface Props {
  trades: Trade[]
  assets: Asset[]
  categories: PortfolioCategory[]
  onDeleteTrade: (tradeId: string) => Promise<void>
  onSyncMissingTrades: () => Promise<void>
}

export const TradesTab = ({
  trades,
  assets,
  categories,
  onDeleteTrade,
  onSyncMissingTrades,
}: Props) => {
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set())
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

  const tickerToAsset = useMemo(
    () => Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a])),
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
      <FilterBar
        filterCatId={filterCatId}
        activeCategories={activeCategories}
        syncing={syncing}
        onSetFilterCatId={setFilterCatId}
        onSync={handleSync}
      />

      <p className="text-xs text-muted-foreground">
        {grouped.length} ativo(s) · {filteredTrades.length} operação(ões)
      </p>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma movimentação nesta categoria.
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {grouped.map(({ ticker, items, bought, sold, totalInvested }, idx) => (
            <div key={ticker} className={cn(idx > 0 && 'border-t border-border')}>
              <TickerRow
                ticker={ticker}
                items={items}
                bought={bought}
                sold={sold}
                totalInvested={totalInvested}
                isExpanded={expandedTickers.has(ticker)}
                onToggle={toggle}
                onDeleteTrade={onDeleteTrade}
                asset={tickerToAsset[ticker.toUpperCase()]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
