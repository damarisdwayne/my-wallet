import type { AssetType } from '@/types'

export const ASSET_TYPES: AssetType[] = [
  'stock',
  'fii',
  'bdr',
  'etf',
  'tesouro',
  'fixed_income',
  'crypto',
  'stock_us',
  'etf_us',
  'other',
]

export const ALL = 'all'

export const typeLabel: Record<AssetType, string> = {
  stock: 'Ações BR',
  fii: 'Fundos Imob.',
  bdr: 'BDR',
  etf: 'ETF BR',
  tesouro: 'Tesouro Direto',
  fixed_income: 'Renda Fixa',
  crypto: 'Cripto',
  stock_us: 'Ações EUA',
  etf_us: 'ETF EUA',
  other: 'Outros',
}
