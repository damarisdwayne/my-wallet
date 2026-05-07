import type { FiiInfo, StockInfo } from '@/types'

export const FII_INFO_FIELDS: {
  key: keyof Omit<FiiInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
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
  { key: 'subsector', label: 'Subsetor / Segmento', placeholder: 'Ex: Bancos / Large Caps' },
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
