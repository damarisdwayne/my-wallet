export interface TesouroBond {
  tipo: string
  vencimento: string
  dataBase: string
  taxaCompra: number
  taxaVenda: number
  puCompra: number
  puVenda: number
  label: string
  ticker: string
  maturityISO: string
}

const CACHE_KEY = 'mw_tesouro_v1'
const TTL_MS = 60 * 60 * 1000

const parseNum = (s: string) => parseFloat(s.replace(',', '.'))

const dateToISO = (d: string): string => {
  const [dd, mm, yyyy] = d.split('/')
  return `${yyyy}-${mm}-${dd}`
}

const dateSortKey = (d: string): string => {
  const [dd, mm, yyyy] = d.split('/')
  return `${yyyy}${mm}${dd}`
}

export const clearTesouroBondsCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {}
}

export const fetchTesouroBonds = async (): Promise<TesouroBond[]> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const { bonds, updatedAt } = JSON.parse(raw) as { bonds: TesouroBond[]; updatedAt: number }
      if (Date.now() - updatedAt < TTL_MS) return bonds
    }
  } catch {}

  const res = await fetch('/api/tesouro')
  if (!res.ok) throw new Error('Falha ao buscar dados do Tesouro Direto')
  const text = await res.text()

  const lines = text
    .trim()
    .split('\n')
    .slice(1)
    .filter((l) => l.trim())

  const all = lines.flatMap((line) => {
    const p = line.trim().split(';')
    if (p.length < 8) return []
    return [
      {
        tipo: p[0],
        vencimento: p[1],
        dataBase: p[2],
        taxaCompra: parseNum(p[3]),
        taxaVenda: parseNum(p[4]),
        puCompra: parseNum(p[5]),
        puVenda: parseNum(p[6]),
      },
    ]
  })

  const allDates = [...new Set(all.map((b) => b.dataBase))]
  allDates.sort((a, b) => dateSortKey(b).localeCompare(dateSortKey(a)))
  const latestDate = allDates[0]

  const bonds: TesouroBond[] = all
    .filter((b) => b.dataBase === latestDate)
    .map((b) => {
      const year = b.vencimento.split('/')[2]
      const label = `${b.tipo} ${year}`
      return { ...b, label, ticker: label.toUpperCase(), maturityISO: dateToISO(b.vencimento) }
    })

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ bonds, updatedAt: Date.now() }))
  } catch {}

  return bonds
}

export const fetchTesouroPriceMap = async (tickers: string[]): Promise<Record<string, number>> => {
  const bonds = await fetchTesouroBonds()
  const prices: Record<string, number> = {}
  for (const ticker of tickers) {
    const bond = bonds.find((b) => b.ticker === ticker.toUpperCase())
    if (bond) prices[ticker.toUpperCase()] = bond.puVenda
  }
  return prices
}
