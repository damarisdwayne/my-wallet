export type StockSector =
  | 'Financeiro'
  | 'Energia Elétrica'
  | 'Petróleo e Gás'
  | 'Materiais Básicos'
  | 'Consumo Cíclico'
  | 'Consumo não Cíclico'
  | 'Saúde'
  | 'Tecnologia'
  | 'Telecomunicações'
  | 'Saneamento'
  | 'Utilidade Pública'
  | 'Construção'
  | 'Transporte'
  | 'Agronegócio'
  | 'Indústria'
  | 'Outros'

export const STOCK_SECTOR_COLORS: Record<StockSector, string> = {
  Financeiro: '#3b82f6',
  'Energia Elétrica': '#f59e0b',
  'Petróleo e Gás': '#78716c',
  'Materiais Básicos': '#f97316',
  'Consumo Cíclico': '#8b5cf6',
  'Consumo não Cíclico': '#22c55e',
  Saúde: '#ec4899',
  Tecnologia: '#06b6d4',
  Telecomunicações: '#6366f1',
  Saneamento: '#14b8a6',
  'Utilidade Pública': '#84cc16',
  Construção: '#ef4444',
  Transporte: '#0ea5e9',
  Agronegócio: '#a3e635',
  Indústria: '#d97706',
  Outros: '#6b7280',
}

const clean = (s: string) =>
  s.normalize('NFD').replaceAll(/[̀-ͯ]/g, '').replaceAll(/\s+/g, '').toLowerCase()

const SECTOR_KEYWORDS: [string[], StockSector][] = [
  [['financ', 'banco', 'segur', 'credito', 'asset'], 'Financeiro'],
  [
    ['energiaelet', 'geracao', 'transmissaodeenergia', 'distribuidoradeenergia'],
    'Energia Elétrica',
  ],
  [['petrole', 'petroleo', 'combustivel', 'biocombust'], 'Petróleo e Gás'],
  [['material', 'siderur', 'metalur', 'minerac', 'celulose', 'quimic'], 'Materiais Básicos'],
  [['consumocicl', 'varejo', 'vestuario', 'lazer', 'automot'], 'Consumo Cíclico'],
  [['consumonaocicl', 'aliment', 'bebida', 'higiene'], 'Consumo não Cíclico'],
  [['saude', 'medic', 'hospital', 'farmac', 'diagnost'], 'Saúde'],
  [['tecnolog', 'software', 'tecinf'], 'Tecnologia'],
  [['telecom', 'telefon', 'comunicac'], 'Telecomunicações'],
  [['saneament', 'agua', 'esgoto'], 'Saneamento'],
  [['utilidade', 'concession'], 'Utilidade Pública'],
  [['constru', 'imobil', 'incorpor', 'engenharia'], 'Construção'],
  [['transport', 'logist', 'ferrovia', 'aviacao', 'rodovia'], 'Transporte'],
  [['agroneg', 'agrop', 'agric', 'rural', 'grao', 'soja', 'cana'], 'Agronegócio'],
  [
    [
      'industri',
      'manufat',
      'maquina',
      'equipam',
      'motor',
      'compressor',
      'bensdecapital',
      'bensindustri',
      'eletronico',
      'componente',
    ],
    'Indústria',
  ],
]

export const normalizeStockSector = (sector: string): StockSector => {
  const n = clean(sector)
  for (const [keywords, s] of SECTOR_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return s
  }
  return 'Outros'
}

export const getStockSector = (
  _ticker: string,
  sector?: string,
  subsector?: string,
): StockSector => {
  if (subsector?.trim()) {
    const fromSub = normalizeStockSector(subsector)
    if (fromSub !== 'Outros') return fromSub
  }
  if (sector?.trim()) return normalizeStockSector(sector)
  return 'Outros'
}
