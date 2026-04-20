export interface MarketData {
  usdBrl: number
  usdBrlChange: number
  btcBrl: number
  btcBrlChange: number
  selic: number // % a.a.
  ipca12m: number // % acumulado 12 meses
  igpm12m: number // % acumulado 12 meses
  updatedAt: number
}

const CACHE_KEY = 'mw_market_v1'
const TTL_MS = 60 * 60 * 1000 // 1 hora

export function clearMarketCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {}
}

function loadCache(): MarketData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MarketData
    if (Date.now() - parsed.updatedAt > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function saveCache(data: MarketData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {}
}

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

function compound(monthlyRates: number[]): number {
  return (monthlyRates.reduce((acc, r) => acc * (1 + r / 100), 1) - 1) * 100
}

export async function fetchMarketData(): Promise<MarketData> {
  const cached = loadCache()
  if (cached) return cached

  type AwesomeResp = { USDBRL: { bid: string; pctChange: string } }
  type CgResp = { bitcoin: { brl: number; brl_24h_change: number } }
  type BcbEntry = { data: string; valor: string }

  const BCB = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

  const [awesome, cg, selicRaw, ipcaRaw, igpmRaw] = await Promise.all([
    safeJson<AwesomeResp>('https://economia.awesomeapi.com.br/last/USD-BRL'),
    safeJson<CgResp>(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true',
    ),
    safeJson<BcbEntry[]>(`${BCB}.11/dados/ultimos/1?formato=json`), // SELIC % a.d.
    safeJson<BcbEntry[]>(`${BCB}.433/dados/ultimos/12?formato=json`), // IPCA mensal
    safeJson<BcbEntry[]>(`${BCB}.189/dados/ultimos/12?formato=json`), // IGP-M mensal
  ])

  const usdBrl = awesome ? parseFloat(awesome.USDBRL?.bid ?? '0') : 0
  const usdBrlChange = awesome ? parseFloat(awesome.USDBRL?.pctChange ?? '0') : 0

  const btcBrl = cg?.bitcoin?.brl ?? 0
  const btcBrlChange = cg?.bitcoin?.brl_24h_change ?? 0

  // SELIC diária (% a.d.) → anualizar base 252 dias úteis
  const selicDay = selicRaw?.[0] ? parseFloat(selicRaw[0].valor) : 0
  const selic = selicDay > 0 ? ((1 + selicDay / 100) ** 252 - 1) * 100 : 0

  const ipca12m = ipcaRaw ? compound(ipcaRaw.map((e) => parseFloat(e.valor))) : 0
  const igpm12m = igpmRaw ? compound(igpmRaw.map((e) => parseFloat(e.valor))) : 0

  const data: MarketData = {
    usdBrl,
    usdBrlChange,
    btcBrl,
    btcBrlChange,
    selic,
    ipca12m,
    igpm12m,
    updatedAt: Date.now(),
  }

  saveCache(data)
  return data
}
