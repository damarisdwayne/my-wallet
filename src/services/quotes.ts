import type { AssetType } from '@/types'
import { fetchTesouroPriceMap } from '@/services/tesouro'
import type { TickerSets } from '@/lib/ir-calc'

export type { TickerSets } from '@/lib/ir-calc'

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

// Fetches the historical PTAX USD/BRL rate for a specific date (YYYY-MM-DD).
// Falls back to current rate if the date is unavailable (weekend/holiday).
export const fetchUsdBrlRateForDate = async (date: string): Promise<number> => {
  const key = `mw_usd_ptax_${date}`
  try {
    const cached = localStorage.getItem(key)
    if (cached) return Number(cached)
  } catch {}
  try {
    const d = date.replaceAll('-', '')
    const res = await fetch(
      `https://economia.awesomeapi.com.br/json/daily/USD-BRL/1?start_date=${d}&end_date=${d}`,
    )
    if (res.ok) {
      const data = (await res.json()) as { bid: string }[]
      if (Array.isArray(data) && data.length > 0) {
        const rate = Number.parseFloat(data[0].bid)
        if (rate > 0) {
          try {
            localStorage.setItem(key, String(rate))
          } catch {}
          return rate
        }
      }
    }
  } catch {}
  return fetchUsdBrlRate()
}

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

const BR_STOCK_TYPES = new Set<AssetType>(['stock', 'fii', 'bdr', 'etf'])
const isUsType = (type: AssetType) => type === 'stock_us' || type === 'etf_us'

async function fetchTesouroPrices(tickers: string[]): Promise<Record<string, number>> {
  try {
    return await fetchTesouroPriceMap(tickers)
  } catch {
    return {}
  }
}

/* ── ticker sets (for type inference) ── */

const TICKER_SETS_KEY = 'mw_ticker_sets_v1'
const TICKER_SETS_TTL_MS = 24 * 60 * 60 * 1000

const fetchTickerPage = async (type: 'fund' | 'stock' | 'bdr', page: number): Promise<string[]> => {
  try {
    const res = await fetch(`https://brapi.dev/api/quote/list?type=${type}&limit=500&page=${page}`)
    if (!res.ok) return []
    const data = (await res.json()) as { stocks: { stock: string }[] }
    return data.stocks?.map((s) => s.stock.toUpperCase()) ?? []
  } catch {
    return []
  }
}

const fetchAllOfType = async (type: 'fund' | 'stock' | 'bdr'): Promise<string[]> => {
  try {
    const res = await fetch(`https://brapi.dev/api/quote/list?type=${type}&limit=500&page=1`)
    if (!res.ok) return []
    const data = (await res.json()) as { stocks: { stock: string }[]; totalPages: number }
    const first = data.stocks?.map((s) => s.stock.toUpperCase()) ?? []
    const remaining = Array.from({ length: data.totalPages - 1 }, (_, i) =>
      fetchTickerPage(type, i + 2),
    )
    const rest = await Promise.all(remaining)
    return [...first, ...rest.flat()]
  } catch {
    return []
  }
}

export const fetchTickerSets = async (): Promise<TickerSets> => {
  try {
    const raw = localStorage.getItem(TICKER_SETS_KEY)
    if (raw) {
      const { fii, stock, bdr, updatedAt } = JSON.parse(raw) as {
        fii: string[]
        stock: string[]
        bdr: string[]
        updatedAt: number
      }
      if (Date.now() - updatedAt < TICKER_SETS_TTL_MS)
        return { fii: new Set(fii), stock: new Set(stock), bdr: new Set(bdr) }
    }
  } catch {}

  const [fiiList, stockList, bdrList] = await Promise.all([
    fetchAllOfType('fund'),
    fetchAllOfType('stock'),
    fetchAllOfType('bdr'),
  ])

  try {
    localStorage.setItem(
      TICKER_SETS_KEY,
      JSON.stringify({ fii: fiiList, stock: stockList, bdr: bdrList, updatedAt: Date.now() }),
    )
  } catch {}

  return { fii: new Set(fiiList), stock: new Set(stockList), bdr: new Set(bdrList) }
}

export async function fetchLivePrices(
  assets: { ticker: string; type: AssetType }[],
): Promise<Record<string, number>> {
  const tickers = assets.map((a) => a.ticker.toUpperCase())
  const cached = loadCache(tickers)
  if (cached) return cached

  const typeOf = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a.type]))
  const brTickers = tickers.filter((t) => BR_STOCK_TYPES.has(typeOf[t]))
  const usTickers = tickers.filter((t) => isUsType(typeOf[t]))
  const cryptoTickers = tickers.filter((t) => typeOf[t] === 'crypto')
  const tesouroTickers = tickers.filter((t) => typeOf[t] === 'tesouro')

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

export interface HistoricalPoint {
  date: string
  close: number
}

const HIST_CACHE_KEY = 'mw_hist_v1'
const HIST_TTL_MS = 60 * 60 * 1000

const loadHistCache = (ticker: string): HistoricalPoint[] | null => {
  try {
    const raw = localStorage.getItem(`${HIST_CACHE_KEY}_${ticker}`)
    if (!raw) return null
    const { data, updatedAt } = JSON.parse(raw) as { data: HistoricalPoint[]; updatedAt: number }
    return Date.now() - updatedAt < HIST_TTL_MS ? data : null
  } catch {
    return null
  }
}

const saveHistCache = (ticker: string, data: HistoricalPoint[]) => {
  try {
    localStorage.setItem(
      `${HIST_CACHE_KEY}_${ticker}`,
      JSON.stringify({ data, updatedAt: Date.now() }),
    )
  } catch {
    // ignore
  }
}

export const fetchHistoricalPrices = async (ticker: string): Promise<HistoricalPoint[]> => {
  const cached = loadHistCache(ticker)
  if (cached) return cached

  const token = import.meta.env.VITE_BRAPI_TOKEN as string | undefined
  if (!token) return []

  try {
    const url = `https://brapi.dev/api/quote/${ticker}?range=1mo&interval=1d&token=${token}`
    const res = await fetch(url)
    if (!res.ok) return []
    const json = (await res.json()) as {
      results?: { historicalDataPrice?: { date: number; close: number }[] }[]
    }
    const raw = json.results?.[0]?.historicalDataPrice ?? []
    const data = raw
      .filter((p) => p.close > 0)
      .map((p) => ({ date: new Date(p.date * 1000).toISOString().slice(0, 10), close: p.close }))
      .slice(-20)
    saveHistCache(ticker, data)
    return data
  } catch {
    return []
  }
}
