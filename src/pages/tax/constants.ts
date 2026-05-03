export const assetTypeLabel: Record<string, string> = {
  stock: 'Ações',
  fii: 'FII',
  etf: 'ETF',
  bdr: 'BDR',
  tesouro: 'Tesouro Direto',
  fixed_income: 'Renda Fixa',
  crypto: 'Cripto',
  stock_us: 'Exterior',
  etf_us: 'ETF Exterior',
  other: 'Outros',
}

export type Tab = 'bens' | 'isentos' | 'tributavel' | 'exterior' | 'rv' | 'guia'

export const TABS: { id: Tab; label: string }[] = [
  { id: 'bens', label: 'Bens e Direitos' },
  { id: 'isentos', label: 'Rendimentos Isentos' },
  { id: 'tributavel', label: 'Tributação Exclusiva' },
  { id: 'exterior', label: 'Rendimentos do Exterior' },
  { id: 'rv', label: 'Renda Variável' },
  { id: 'guia', label: 'Guia IR' },
]
