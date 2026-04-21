import type { AssetType } from '@/types'

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  BNB: 'binancecoin',
  XRP: 'ripple',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
}

const CACHE_KEY = 'mw_quotes_v1'
const TTL_MS = 5 * 60 * 1000

interface QuoteCache {
  prices: Record<string, number>
  tickers: string[]
  updatedAt: number
}

function loadCache(tickers: string[]): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw) as QuoteCache
    if (Date.now() - cache.updatedAt > TTL_MS) return null
    if (!tickers.every((t) => t in cache.prices)) return null
    return cache.prices
  } catch {
    return null
  }
}

function saveCache(tickers: string[], prices: Record<string, number>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ prices, tickers, updatedAt: Date.now() }))
  } catch {}
}

export function clearQuoteCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {}
}

const USD_RATE_KEY = 'mw_usd_rate_v1'
const USD_TTL_MS = 15 * 60 * 1000

export const fetchUsdBrlRate = async (): Promise<number> => {
  try {
    const cached = localStorage.getItem(USD_RATE_KEY)
    if (cached) {
      const { rate, updatedAt } = JSON.parse(cached) as { rate: number; updatedAt: number }
      if (Date.now() - updatedAt < USD_TTL_MS) return rate
    }
  } catch {}
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
    if (!res.ok) return 1
    const data = (await res.json()) as { USDBRL: { bid: string } }
    const rate = Number.parseFloat(data.USDBRL.bid)
    if (rate > 0) {
      try {
        localStorage.setItem(USD_RATE_KEY, JSON.stringify({ rate, updatedAt: Date.now() }))
      } catch {}
      return rate
    }
  } catch {}
  return 1
}

type BrapiResp =
  | { results: { symbol: string; regularMarketPrice: number }[] }
  | { error: boolean; message: string }

async function fetchBrapiTicker(
  ticker: string,
  token: string,
  currency?: string,
): Promise<BrapiResp | null> {
  const params = currency ? `currency=${currency}&token=${token}` : `token=${token}`
  return fetch(`https://brapi.dev/api/quote/${ticker}?${params}`)
    .then((r) => r.json() as Promise<BrapiResp>)
    .catch(() => null)
}

// Brazilian assets (stock, fii, bdr, etf ending in digits) — already quoted in BRL
async function fetchStockPrices(tickers: string[]): Promise<Record<string, number>> {
  const token = import.meta.env.VITE_BRAPI_TOKEN as string | undefined
  if (!token) throw new Error('VITE_BRAPI_TOKEN não configurado no .env')

  const results = await Promise.all(tickers.map((t) => fetchBrapiTicker(t, token, 'BRL')))
  const prices: Record<string, number> = {}

  for (const data of results) {
    if (!data || 'error' in data) continue // skip failed tickers, don't abort all
    const item = data.results?.[0]
    if (item?.regularMarketPrice) prices[item.symbol.toUpperCase()] = item.regularMarketPrice
  }

  return prices
}

// US assets (stock_us and letter-only etf) — fetch USD price then convert to BRL
async function fetchUsStockPrices(tickers: string[]): Promise<Record<string, number>> {
  const token = import.meta.env.VITE_BRAPI_TOKEN as string | undefined
  if (!token) return {}

  const [results, usdRate] = await Promise.all([
    Promise.all(tickers.map((t) => fetchBrapiTicker(t, token))),
    fetchUsdBrlRate(),
  ])

  const prices: Record<string, number> = {}
  for (const data of results) {
    if (!data || 'error' in data) continue
    const item = data.results?.[0]
    if (item?.regularMarketPrice)
      prices[item.symbol.toUpperCase()] = Math.round(item.regularMarketPrice * usdRate * 100) / 100
  }

  return prices
}

async function fetchCryptoPrices(tickers: string[]): Promise<Record<string, number>> {
  const idMap = Object.fromEntries(tickers.map((t) => [t, CRYPTO_IDS[t] ?? t.toLowerCase()]))
  const ids = [...new Set(Object.values(idMap))].join(',')

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`,
    )
    if (!res.ok) return {}
    const data = (await res.json()) as Record<string, { brl: number }>
    return Object.fromEntries(
      Object.entries(idMap).flatMap(([ticker, id]) =>
        data[id]?.brl ? [[ticker, data[id].brl]] : [],
      ),
    )
  } catch {
    return {}
  }
}

const BR_STOCK_TYPES = new Set<AssetType>(['stock', 'fii', 'bdr'])
// ETFs with digits in the ticker are Brazilian (BOVA11, IVVB11…); letter-only are US (VOO, SPY…)
const isUsTicker = (ticker: string, type: AssetType) =>
  type === 'stock_us' || (type === 'etf' && !/\d/.test(ticker))

interface DadosMercadoBond {
  name: string
  pu: number
}

async function fetchTesouroPrices(tickers: string[]): Promise<Record<string, number>> {
  const token = import.meta.env.VITE_DADOSDEMERCADO_TOKEN as string | undefined
  if (!token) return {}
  try {
    const res = await fetch('https://api.dadosdemercado.com.br/v1/treasury', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return {}
    const bonds = (await res.json()) as DadosMercadoBond[]
    const prices: Record<string, number> = {}
    for (const ticker of tickers) {
      // ticker: "TESOURO IPCA+ 2029" — API name: "Tesouro IPCA+ 2029"
      const match = bonds.find((b) => b.name.toUpperCase() === ticker.toUpperCase())
      if (match?.pu) prices[ticker] = match.pu
    }
    return prices
  } catch {
    return {}
  }
}

export async function fetchLivePrices(
  assets: { ticker: string; type: AssetType }[],
): Promise<Record<string, number>> {
  const tickers = assets.map((a) => a.ticker.toUpperCase())
  const cached = loadCache(tickers)
  if (cached) return cached

  const typeOf = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a.type]))
  const brTickers = tickers.filter(
    (t) => BR_STOCK_TYPES.has(typeOf[t]) || (typeOf[t] === 'etf' && !isUsTicker(t, typeOf[t])),
  )
  const usTickers = tickers.filter((t) => isUsTicker(t, typeOf[t]))
  const cryptoTickers = tickers.filter((t) => typeOf[t] === 'crypto')
  const tesouroTickers = tickers.filter((t) => t.startsWith('TESOURO'))

  const [stockPrices, usPrices, cryptoPrices, tesouroPrices] = await Promise.all([
    brTickers.length > 0 ? fetchStockPrices(brTickers) : {},
    usTickers.length > 0 ? fetchUsStockPrices(usTickers) : {},
    cryptoTickers.length > 0 ? fetchCryptoPrices(cryptoTickers) : {},
    tesouroTickers.length > 0 ? fetchTesouroPrices(tesouroTickers) : {},
  ])

  const prices = { ...stockPrices, ...usPrices, ...cryptoPrices, ...tesouroPrices }
  saveCache(tickers, prices)
  return prices
}
