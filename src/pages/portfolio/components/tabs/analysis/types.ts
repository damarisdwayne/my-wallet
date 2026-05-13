import type {
  Asset,
  ExteriorInfo,
  FiiInfo,
  FundamentalRecord,
  FundamentalSnapshot,
  PortfolioCategory,
  StockInfo,
} from '@/types'

export interface Props {
  uid: string | null
  assets: Asset[]
  categories: PortfolioCategory[]
  fundamentals: Record<string, FundamentalRecord>
  saveManualSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  deleteSnapshot: (ticker: string, fetchedAt: string) => Promise<void>
  fiiInfo: Record<string, FiiInfo>
  saveFiiInfo: (data: FiiInfo) => Promise<void>
  stockInfo: Record<string, StockInfo>
  saveStockInfo: (data: StockInfo) => Promise<void>
  exteriorInfo: Record<string, ExteriorInfo>
  saveExteriorInfo: (data: ExteriorInfo) => Promise<void>
}

export type TrendType = 'up-good' | 'up-bad' | 'neutral'

export interface IndicatorTooltip {
  title: string
  description: string
  ideal?: string
  calc?: string
}

export interface IndicatorDef {
  key: keyof FundamentalSnapshot
  label: string
  format: (v: number) => string
  trendType: TrendType
  inputStep?: string
  inputLabel?: string
  tooltip?: IndicatorTooltip
}

export interface FiiTextDef {
  type: 'text'
  key: keyof FundamentalSnapshot
  label: string
  inputPlaceholder?: string
  tooltip?: IndicatorTooltip
}

export interface FiiNumericDef {
  type: 'number'
  key: keyof FundamentalSnapshot
  label: string
  format: (v: number) => string
  trendType: TrendType
  inputStep?: string
  inputLabel?: string
  tooltip?: IndicatorTooltip
}

export type FiiIndicatorDef = FiiNumericDef | FiiTextDef
