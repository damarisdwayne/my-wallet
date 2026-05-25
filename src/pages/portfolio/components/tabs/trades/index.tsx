import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Asset, ImportRecord, PortfolioCategory, Trade } from '@/types'
import { ALL } from '../../../constants'
import { FilterBar, TickerRow } from './components'
import { ImportsTab } from '../imports'

interface Props {
  trades: Trade[]
  assets: Asset[]
  categories: PortfolioCategory[]
  onDeleteTrade: (tradeId: string) => Promise<void>
  onSyncMissingTrades: () => Promise<void>
  importRecords: ImportRecord[]
  onRevertImport: (record: ImportRecord) => Promise<void>
}

export const TradesTab = ({
  trades,
  assets,
  categories,
  onDeleteTrade,
  onSyncMissingTrades,
  importRecords,
  onRevertImport,
}: Props) => {
  const [section, setSection] = useState<'trades' | 'imports'>('trades')
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

  // Prefixes used to identify fixed income / tesouro tickers when the asset was already deleted
  const FI_PREFIXES = [
    'CDB',
    'LC',
    'LCI',
    'LCA',
    'LCE',
    'CRI',
    'CRA',
    'DEBENTURE',
    'OUTROS',
    'TESOURO',
  ]
  const isFiTicker = (t: string) => FI_PREFIXES.some((p) => t === p || t.startsWith(p + ' '))

  const tickerToCatId = useMemo(() => {
    const byName = Object.fromEntries(assets.map((a) => [a.name.toUpperCase(), a.categoryId]))
    const byTicker = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a.categoryId]))
    const map: Record<string, string> = { ...byName, ...byTicker }

    // For trades from deleted fixed income assets, infer category by ticker prefix
    const fiCatId = categories.find((c) =>
      c.assetTypes.some((t) => t === 'fixed_income' || t === 'tesouro'),
    )?.id
    if (fiCatId) {
      for (const t of trades) {
        const key = t.ticker.toUpperCase()
        if (!map[key] && isFiTicker(key)) map[key] = fiCatId
      }
    }
    return map
  }, [assets, categories, trades])

  const tickerToAsset = useMemo(() => {
    const byName = Object.fromEntries(assets.map((a) => [a.name.toUpperCase(), a]))
    const byTicker = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a]))
    return { ...byName, ...byTicker }
  }, [assets])

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (c) =>
          assets.some((a) => a.categoryId === c.id) ||
          trades.some((t) => tickerToCatId[t.ticker.toUpperCase()] === c.id),
      ),
    [categories, assets, trades, tickerToCatId],
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

  const subNav = (
    <div className="flex gap-2">
      {(['trades', 'imports'] as const).map((s) => (
        <button
          key={s}
          onClick={() => setSection(s)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            section === s
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {s === 'trades' ? 'Movimentações' : 'Importações'}
        </button>
      ))}
    </div>
  )

  if (section === 'imports') {
    return (
      <div className="space-y-4">
        {subNav}
        <ImportsTab records={importRecords} onRevert={onRevertImport} />
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="space-y-4">
        {subNav}
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {subNav}
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
