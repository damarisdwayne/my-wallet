export type FiiSector =
  | 'Papel'
  | 'Logística'
  | 'Shoppings'
  | 'Lajes Corporativas'
  | 'Residencial'
  | 'Híbrido'
  | 'FOF'
  | 'Agro'
  | 'Hotel'
  | 'Outros'

export const FII_SECTOR_COLORS: Record<FiiSector, string> = {
  Papel: '#f59e0b',
  Logística: '#3b82f6',
  Shoppings: '#8b5cf6',
  'Lajes Corporativas': '#22c55e',
  Residencial: '#ec4899',
  Híbrido: '#f97316',
  FOF: '#06b6d4',
  Agro: '#84cc16',
  Hotel: '#ef4444',
  Outros: '#6b7280',
}

const clean = (s: string) =>
  s.normalize('NFD').replaceAll(/[̀-ͯ]/g, '').replaceAll(/\s+/g, '').toLowerCase()

const SEGMENT_KEYWORDS: [string[], FiiSector][] = [
  [['papel', 'cri', 'cra', 'recebivel', 'receivable'], 'Papel'],
  [['logis', 'galpao', 'industrial', 'armazem'], 'Logística'],
  [['shop', 'varejo', 'mall'], 'Shoppings'],
  [['laje', 'corporat', 'escritorio', 'office'], 'Lajes Corporativas'],
  [['resid', 'habitacional'], 'Residencial'],
  [['hibrido', 'misto', 'diversif'], 'Híbrido'],
  [['fof', 'fundodefundo'], 'FOF'],
  [['agro', 'rural', 'fazenda'], 'Agro'],
  [['hotel', 'hospedagem', 'hotelaria'], 'Hotel'],
]

export const normalizeSector = (segment: string): FiiSector => {
  const n = clean(segment)
  for (const [keywords, sector] of SEGMENT_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return sector
  }
  return 'Outros'
}

export const getFiiSector = (_ticker: string, segment?: string): FiiSector => {
  if (segment?.trim()) return normalizeSector(segment)
  return 'Outros'
}
