import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'

export interface AssetAllocation {
  asset: Asset
  aporte: number
  quantityToBuy: number
  recommendedValue: number
  valueAfterAporte: number
}

export interface CategoryAllocation {
  cat: PortfolioCategory
  catCurrentValue: number
  catAporte: number
  catRecommendedValue: number
  catValueAfterAporte: number
  catPercentBefore: number
  catPercentAfter: number
  assetAllocations: AssetAllocation[]
}

export interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  totalValue: number
  refreshPrices: () => Promise<void>
  refreshingPrices: boolean
}
