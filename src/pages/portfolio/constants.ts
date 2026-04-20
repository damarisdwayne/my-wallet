import type { AssetType } from '@/types'

export const ASSET_TYPES: AssetType[] = [
  'stock',
  'fii',
  'bdr',
  'etf',
  'fixed_income',
  'crypto',
  'other',
]

export const ALL = 'all'

export const typeLabel: Record<AssetType, string> = {
  stock: 'Ações BR',
  fii: 'Fundos Imob.',
  bdr: 'BDR',
  etf: 'ETF',
  fixed_income: 'Renda Fixa',
  crypto: 'Cripto',
  other: 'Outros',
}
