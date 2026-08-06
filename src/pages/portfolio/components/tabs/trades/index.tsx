import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn, isUsdQuoted } from '@/lib/utils'
import { useDisplayCurrency } from '@/store/display-currency'
import type { Asset, ImportRecord, PortfolioCategory, Trade } from '@/types'
import { ALL } from '../../../constants'
import { DividendsSection, FilterBar, TickerRow } from './components'
import { ImportsTab } from '../imports'

type Section = 'trades' | 'dividends' | 'imports'

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'trades', label: 'Movimentações' },
  { value: 'dividends', label: 'Proventos' },
  { value: 'imports', label: 'Importações' },
]

interface Props {
  trades: Trade[]
  assets: Asset[]
  categories: PortfolioCategory[]
  onDeleteTrade: (tradeId: string) => Promise<void>
  onEditTrade: (tradeId: string, patch: Partial<Trade>) => Promise<void>
  onRecomputeAll: () => Promise<{ updated: number; closed: number }>
  importRecords: ImportRecord[]
  onRevertImport: (record: ImportRecord) => Promise<void>
  onCleanupOrphanTrades: () => Promise<void>
  orphanTradeCount: number
}

export const TradesTab = ({
  trades,
  assets,
  categories,
  onDeleteTrade,
  onEditTrade,
  onRecomputeAll,
  importRecords,
  onRevertImport,
  onCleanupOrphanTrades,
  orphanTradeCount,
}: Props) => {
  const [section, setSection] = useState<Section>('trades')
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set())
  const [filterCatId, setFilterCatId] = useState<string | typeof ALL>(ALL)
  const [recomputing, setRecomputing] = useState(false)
  const { usdRate } = useDisplayCurrency()

  // Recompute every ticker's position from its movements.
  const handleRecompute = async () => {
    setRecomputing(true)
    try {
      const { updated, closed } = await onRecomputeAll()
      const closedMsg = closed ? `, ${closed} fechada(s)` : ''
      if (updated === 0 && closed === 0) toast.info('Nenhuma posição precisou de ajuste')
      else toast.success(`${updated} posição(ões) recalculada(s)${closedMsg}`)
    } catch {
      toast.error('Erro ao recalcular posições')
    } finally {
      setRecomputing(false)
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
    // Total por ticker em USD: usa o valor original quando todas as compras o têm; senão
    // converte o BRL pelo câmbio atual (aproximado — só pra leitura, nunca persistido).
    const totalUsdFor = (buys: Trade[], totalBrl: number, asset: Asset | undefined) => {
      if (buys.length > 0 && buys.every((t) => t.totalUsd != null))
        return { usd: buys.reduce((s, t) => s + (t.totalUsd ?? 0), 0), approx: false }
      if (isUsdQuoted(asset?.type) && usdRate > 0) return { usd: totalBrl / usdRate, approx: true }
      return { usd: undefined, approx: false }
    }

    const map = new Map<string, Trade[]>()
    for (const t of filteredTrades) {
      const list = map.get(t.ticker) ?? []
      list.push(t)
      map.set(t.ticker, list)
    }
    return [...map.entries()]
      .map(([ticker, items]) => {
        const buys = items.filter((t) => t.type === 'buy')
        const bought = buys.reduce((s, t) => s + t.quantity, 0)
        const sold = items.filter((t) => t.type === 'sell').reduce((s, t) => s + t.quantity, 0)
        const totalInvested = buys.reduce((s, t) => s + t.total, 0)
        const { usd: totalInvestedUsd, approx } = totalUsdFor(
          buys,
          totalInvested,
          tickerToAsset[ticker.toUpperCase()],
        )
        return { ticker, items, bought, sold, totalInvested, totalInvestedUsd, approx }
      })
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
  }, [filteredTrades, tickerToAsset, usdRate])

  const toggle = (ticker: string) =>
    setExpandedTickers((prev) => {
      const next = new Set(prev)
      if (next.has(ticker)) next.delete(ticker)
      else next.add(ticker)
      return next
    })

  const subNav = (
    <div className="flex gap-2">
      {SECTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setSection(value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            section === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  if (section === 'dividends') {
    return (
      <div className="space-y-4">
        {subNav}
        <DividendsSection />
      </div>
    )
  }

  if (section === 'imports') {
    return (
      <div className="space-y-4">
        {subNav}
        <ImportsTab
          records={importRecords}
          onRevert={onRevertImport}
          onCleanupOrphans={onCleanupOrphanTrades}
          orphanCount={orphanTradeCount}
        />
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
        onSetFilterCatId={setFilterCatId}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {grouped.length} ativo(s) · {filteredTrades.length} operação(ões)
        </p>
        <button
          onClick={handleRecompute}
          disabled={recomputing}
          title="Recalcula quantidade e preço médio de cada ativo a partir das movimentações"
          className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw size={12} className={recomputing ? 'animate-spin' : ''} />
          {recomputing ? 'Recalculando...' : 'Recalcular posições'}
        </button>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma movimentação nesta categoria.
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {grouped.map((g, idx) => (
            <div key={g.ticker} className={cn(idx > 0 && 'border-t border-border')}>
              <TickerRow
                ticker={g.ticker}
                items={g.items}
                bought={g.bought}
                sold={g.sold}
                totalInvested={g.totalInvested}
                totalInvestedUsd={g.totalInvestedUsd}
                totalInvestedUsdApprox={g.approx}
                isExpanded={expandedTickers.has(g.ticker)}
                onToggle={toggle}
                onDeleteTrade={onDeleteTrade}
                onEditTrade={onEditTrade}
                asset={tickerToAsset[g.ticker.toUpperCase()]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
