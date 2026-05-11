import { getStockSector, STOCK_SECTOR_COLORS } from '@/lib/stock-sectors'
import type { Asset, StockInfo } from '@/types'
import { SectorBreakdown, type SectorSlice } from './sector-breakdown'

interface Props {
  assets: Asset[]
  stockInfo: Record<string, StockInfo>
}

export const StockSectorBreakdown = ({ assets, stockInfo }: Props) => {
  const stocks = assets.filter((a) => a.type === 'stock')
  const total = stocks.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
  if (stocks.length === 0 || total === 0) return null

  const map = new Map<string, number>()
  for (const a of stocks) {
    const info = stockInfo[a.ticker.toUpperCase()]
    const sector = getStockSector(a.ticker, info?.sector, info?.subsector)
    map.set(sector, (map.get(sector) ?? 0) + a.currentPrice * a.quantity)
  }

  const slices: SectorSlice[] = [...map.entries()]
    .map(([sector, value]) => ({
      sector,
      color: STOCK_SECTOR_COLORS[sector as keyof typeof STOCK_SECTOR_COLORS] ?? '#6b7280',
      value,
      pct: (value / total) * 100,
    }))
    .sort((a, b) => b.value - a.value)

  const hasOthers = slices.some((s) => s.sector === 'Outros')

  return (
    <SectorBreakdown
      title="Distribuição setorial — Ações BR"
      slices={slices}
      othersHint={
        hasOthers
          ? '* Setor não identificado — defina o Setor na aba Análises de cada ação.'
          : undefined
      }
    />
  )
}
