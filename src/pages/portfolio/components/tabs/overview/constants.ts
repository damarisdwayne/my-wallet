import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'
import type { B3Asset } from '@/services/b3-import'

export const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export type SortCol = 'ticker' | 'tipo' | 'qty' | 'pm' | 'price' | 'cost' | 'total' | 'ret' | 'pct'

export type AssetRow = { kind: 'asset'; asset: Asset }
export type GroupRow = {
  kind: 'group'
  label: string
  subtitle: string
  total: number
  cost: number
  recommended: number
  diff: number
  pct: number
}
export type TableRow = AssetRow | GroupRow

export interface OverviewTabProps {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  totalValue: number
  addAsset: (asset: Asset) => Promise<void>
  addManualTrade: (trade: Omit<import('@/types').Trade, 'id' | 'source'>) => Promise<void>
  editAsset: (assetId: string, data: Partial<Asset>) => Promise<void>
  deleteAsset: (assetId: string) => Promise<void>
  importFromB3: (
    assets: B3Asset[],
    trades: import('@/services/b3-import').B3RawTrade[],
    dividends: import('@/services/b3-import').B3ParseResult['dividends'],
    filename: string,
    source?: 'b3' | 'inter',
  ) => Promise<void>
  refreshPrices: () => Promise<void>
  refreshingPrices: boolean
  priceError: string | null
}
