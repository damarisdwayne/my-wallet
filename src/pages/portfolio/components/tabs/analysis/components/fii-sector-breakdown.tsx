import { getFiiSector, FII_SECTOR_COLORS } from '@/lib/fii-sectors'
import type { Asset, FiiInfo } from '@/types'
import { SectorBreakdown, type SectorSlice } from './sector-breakdown'

interface Props {
  assets: Asset[]
  fiiInfo: Record<string, FiiInfo>
}

export const FiiSectorBreakdown = ({ assets, fiiInfo }: Props) => {
  const fiis = assets.filter((a) => a.type === 'fii')
  const total = fiis.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
  if (fiis.length === 0 || total === 0) return null

  const map = new Map<string, number>()
  for (const a of fiis) {
    const info = fiiInfo[a.ticker.toUpperCase()]
    const sector = getFiiSector(a.ticker, info?.segment)
    map.set(sector, (map.get(sector) ?? 0) + a.currentPrice * a.quantity)
  }

  const slices: SectorSlice[] = [...map.entries()]
    .map(([sector, value]) => ({
      sector,
      color: FII_SECTOR_COLORS[sector as keyof typeof FII_SECTOR_COLORS] ?? '#6b7280',
      value,
      pct: (value / total) * 100,
    }))
    .sort((a, b) => b.value - a.value)

  const hasOthers = slices.some((s) => s.sector === 'Outros')

  return (
    <SectorBreakdown
      title="Distribuição setorial — FIIs"
      slices={slices}
      othersHint={
        hasOthers
          ? '* Setor não identificado — defina o segmento na aba Análises de cada FII.'
          : undefined
      }
    />
  )
}
