import type { ExteriorInfo, FiiInfo, StockInfo } from '@/types'

export const FII_INFO_FIELDS: {
  key: keyof Omit<FiiInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  {
    key: 'longName',
    label: 'Nome do Fundo',
    placeholder: 'Ex: XP Malls Fundo de Investimento Imobiliário',
  },
  { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex: 28.757.546/0001-00' },
  { key: 'startDate', label: 'Início do Fundo', placeholder: 'Ex: 2012-05-17 ou 17/05/2012' },
  {
    key: 'segment',
    label: 'Segmento',
    placeholder: 'Ex: Shoppings, Lajes Corporativas, Logística...',
  },
  { key: 'marketCap', label: 'Valor de Mercado', placeholder: 'Ex: R$ 2,4 bi' },
  {
    key: 'adminName',
    label: 'Administradora / Gestora',
    placeholder: 'Ex: BTG Pactual (adm.) / XP Asset (gestora)',
  },
  { key: 'adminFee', label: 'Taxa de Administração', placeholder: 'Ex: 0,85% a.a.' },
  {
    key: 'performanceFee',
    label: 'Taxa de Performance',
    placeholder: 'Ex: 20% sobre IPCA+6% ou Não há',
  },
  {
    key: 'about',
    label: 'Sobre o Fundo',
    placeholder: 'Mini descrição do fundo e estratégia...',
    multiline: true,
  },
]

export const EXTERIOR_INFO_FIELDS: {
  key: keyof Omit<ExteriorInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: 'name', label: 'Nome do ETF', placeholder: 'Ex: iShares 20+ Year Treasury Bond ETF' },
  { key: 'category', label: 'Categoria', placeholder: 'Ex: Renda Fixa EUA, Ações EUA' },
  {
    key: 'trackedIndex',
    label: 'Índice Rastreado',
    placeholder: 'Ex: Bloomberg US 20+ Year Treasury Bond Index',
  },
  { key: 'expenseRatio', label: 'Taxa de Administração', placeholder: 'Ex: 0,15% a.a.' },
  { key: 'aum', label: 'Patrimônio (AUM)', placeholder: 'Ex: USD 17 bi' },
  {
    key: 'about',
    label: 'Sobre o ETF',
    placeholder: 'Mini descrição do ETF e sua estratégia...',
    multiline: true,
  },
]

export const STOCK_INFO_FIELDS: {
  key: keyof Omit<StockInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: 'companyName', label: 'Nome da Empresa', placeholder: 'Ex: Itaú Unibanco Holding S.A.' },
  { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex: 60.872.504/0001-23' },
  { key: 'sector', label: 'Setor', placeholder: 'Ex: Financeiro' },
  { key: 'subsector', label: 'Segmento', placeholder: 'Ex: Bancos Large Cap, Distribuidoras' },
  {
    key: 'about',
    label: 'Sobre a Empresa',
    placeholder: 'Mini descrição da empresa e modelo de negócio...',
    multiline: true,
  },
  { key: 'foundedYear', label: 'Fundação', placeholder: 'Ex: 1945' },
  { key: 'ipoYear', label: 'IPO', placeholder: 'Ex: 2002' },
  { key: 'marketCap', label: 'Valor de Mercado', placeholder: 'Ex: R$ 280 bi' },
  {
    key: 'governanceLevel',
    label: 'Governança',
    placeholder: 'Ex: Novo Mercado, Nível 2, Nível 1',
  },
  { key: 'controller', label: 'Controlador', placeholder: 'Ex: Família Villela / Itaúsa' },
  {
    key: 'geographicExposure',
    label: 'Exposição Geográfica',
    placeholder: 'Ex: Brasil 85%, América Latina 15%',
  },
  { key: 'tagAlong', label: 'Tag Along', placeholder: 'Ex: 100%' },
]
