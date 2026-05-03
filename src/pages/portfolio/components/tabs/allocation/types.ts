import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'

export interface AllocationTabProps {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  saveCategory: (cat: PortfolioCategory) => Promise<void>
  deleteCategory: (catId: string) => Promise<void>
  editAsset: (assetId: string, data: Partial<Asset>) => Promise<void>
  saveDiagram: (diagram: Diagram) => Promise<void>
  deleteDiagram: (diagramId: string) => Promise<void>
  saveAnswers: (assetId: string, answers: AssetAnswers) => Promise<void>
}
