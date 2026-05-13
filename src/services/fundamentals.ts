import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type {
  ExteriorInfo,
  FiiInfo,
  FiiManualData,
  FundamentalRecord,
  FundamentalSnapshot,
  PricePoint,
  StockInfo,
} from '@/types'

const MAX_MONTHS = 12

/* ─── mfinance – stock indicators (free, no key) ───────────────── */

interface MfinanceIndicator {
  name: string
  value: number
}

interface MfinanceIndicatorsResp {
  priceToBookValue?: MfinanceIndicator // P/L
  priceEarningsRatio?: MfinanceIndicator // P/VP
  returnOnEquity?: MfinanceIndicator // ROE %
  returnOnInvestedCapital?: MfinanceIndicator // ROIC %
  returnOnAssets?: MfinanceIndicator // ROA %
  netMargin?: MfinanceIndicator // Mg. Líquida %
  grossMargin?: MfinanceIndicator // Mg. Bruta %
  ebitdaMargin?: MfinanceIndicator // Mg. EBITDA %
  enterpriseValueEbitda?: MfinanceIndicator // EV/EBITDA
  netDebtToEbitda?: MfinanceIndicator // Dív. Líq./EBITDA
  netDebtToAssets?: MfinanceIndicator // Dívida/PL proxy
  cagrRecipesFiveYears?: MfinanceIndicator // Cresc. Receita
  cagrProfitsFiveYears?: MfinanceIndicator // Cresc. Lucro
}

interface MfinanceStockResp {
  dividendYield?: number
  pe?: number
  name?: string
  sector?: string
  subSector?: string
}

interface MfinanceFiiResp {
  dividendYield?: number
  name?: string
  segment?: string
}

export type MfinanceStockIndicators = Partial<{
  priceEarnings: number
  priceToBook: number
  dividendYield: number
  profitMargins: number
  grossMargins: number
  ebitdaMargins: number
  evToEbitda: number
  returnOnEquity: number
  roic: number
  returnOnAssets: number
  debtToEquity: number
  netDebtToEbitda: number
  revenueGrowth: number
  earningsGrowth: number
}>

const tryTickers = async (
  urls: (ticker: string) => string[],
  candidates: string[],
): Promise<Response | null> => {
  for (const ticker of candidates) {
    const res = await fetch(urls(ticker)[0]).catch(() => null)
    if (res?.ok) return res
  }
  return null
}

export const fetchMfinanceFiiIndicators = async (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Partial<{ dividendYield: number; priceToBook: number }>> => {
  const candidates = [ticker, ...previousTickers]
  const res = await tryTickers((t) => [`https://mfinance.com.br/api/v1/fiis/${t}`], candidates)
  if (!res) return {}
  const data = (await res.json()) as MfinanceFiiResp
  return { dividendYield: data.dividendYield }
}

export const fetchMfinanceFiiInfo = async (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Partial<{ name: string; segment: string }>> => {
  const candidates = [ticker, ...previousTickers]
  const res = await tryTickers((t) => [`https://mfinance.com.br/api/v1/fiis/${t}`], candidates)
  if (!res) return {}
  const data = (await res.json()) as MfinanceFiiResp
  return { name: data.name, segment: data.segment }
}

export const fetchMfinanceStockInfo = async (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Partial<{ name: string; sector: string; subSector: string }>> => {
  const candidates = [ticker, ...previousTickers]
  for (const t of candidates) {
    const res = await fetch(`https://mfinance.com.br/api/v1/stocks/${t}`).catch(() => null)
    if (res?.ok) {
      const data = (await res.json()) as MfinanceStockResp
      return { name: data.name, sector: data.sector, subSector: data.subSector }
    }
  }
  return {}
}

export const fetchMfinanceStockIndicators = async (
  ticker: string,
  previousTickers: string[] = [],
): Promise<MfinanceStockIndicators> => {
  const candidates = [ticker, ...previousTickers]

  const findWorking = async (path: (t: string) => string) => {
    for (const t of candidates) {
      const res = await fetch(path(t)).catch(() => null)
      if (res?.ok) return res
    }
    return null
  }

  const [indRes, stockRes] = await Promise.all([
    findWorking((t) => `https://mfinance.com.br/api/v1/stocks/indicators/${t}`),
    findWorking((t) => `https://mfinance.com.br/api/v1/stocks/${t}`),
  ])

  const ind = indRes?.ok ? ((await indRes.json()) as MfinanceIndicatorsResp) : {}
  const stock = stockRes?.ok ? ((await stockRes.json()) as MfinanceStockResp) : {}

  const n = (v?: MfinanceIndicator) => v?.value ?? undefined

  return {
    priceEarnings: n(ind.priceToBookValue) ?? stock.pe, // their "P/L"
    priceToBook: n(ind.priceEarningsRatio), // their "P/VP"
    dividendYield: stock.dividendYield,
    profitMargins: n(ind.netMargin),
    grossMargins: n(ind.grossMargin),
    ebitdaMargins: n(ind.ebitdaMargin),
    evToEbitda: n(ind.enterpriseValueEbitda),
    returnOnEquity: n(ind.returnOnEquity),
    roic: n(ind.returnOnInvestedCapital),
    returnOnAssets: n(ind.returnOnAssets),
    debtToEquity: n(ind.netDebtToAssets),
    netDebtToEbitda: n(ind.netDebtToEbitda),
    revenueGrowth: n(ind.cagrRecipesFiveYears),
    earningsGrowth: n(ind.cagrProfitsFiveYears),
  }
}

/* ─── brapi – sector/industry + P/L (free) ─────────────────────── */

interface BrapiResult {
  priceEarnings?: number | null
  summaryProfile?: { sector?: string | null; industry?: string | null } | null
}

interface BrapiResp {
  results?: BrapiResult[]
  error?: boolean
}

export const fetchBrapiSummary = async (
  ticker: string,
): Promise<{ priceEarnings: number | null; sector: string | null; industry: string | null }> => {
  const token = import.meta.env.VITE_BRAPI_TOKEN as string | undefined
  if (!token) return { priceEarnings: null, sector: null, industry: null }

  const res = await fetch(
    `https://brapi.dev/api/quote/${ticker}?modules=summaryProfile&token=${token}`,
  ).catch(() => null)
  if (!res?.ok) return { priceEarnings: null, sector: null, industry: null }

  const data = (await res.json()) as BrapiResp
  if (data.error) return { priceEarnings: null, sector: null, industry: null }

  const r = data.results?.[0]
  return {
    priceEarnings: r?.priceEarnings ?? null,
    sector: r?.summaryProfile?.sector ?? null,
    industry: r?.summaryProfile?.industry ?? null,
  }
}

/* ─── Firestore – FII static info (manual) ─────────────────────── */

export const saveFiiInfo = (userId: string, data: FiiInfo) =>
  setDoc(doc(db, 'users', userId, 'fii-info', data.ticker.toUpperCase()), data)

export const subscribeToFiiInfo = (userId: string, cb: (data: Record<string, FiiInfo>) => void) =>
  onSnapshot(collection(db, 'users', userId, 'fii-info'), (snap) => {
    const records: Record<string, FiiInfo> = {}
    snap.docs.forEach((d) => {
      records[d.id] = d.data() as FiiInfo
    })
    cb(records)
  })

/* ─── Firestore – Stock static info (manual) ───────────────────── */

export const saveStockInfo = (userId: string, data: StockInfo) =>
  setDoc(doc(db, 'users', userId, 'stock-info', data.ticker.toUpperCase()), data)

export const subscribeToStockInfo = (
  userId: string,
  cb: (data: Record<string, StockInfo>) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'stock-info'), (snap) => {
    const records: Record<string, StockInfo> = {}
    snap.docs.forEach((d) => {
      records[d.id] = d.data() as StockInfo
    })
    cb(records)
  })

/* ─── Firestore – Exterior (ETF/stock US) static info (manual) ─── */

export const saveExteriorInfo = (userId: string, data: ExteriorInfo) =>
  setDoc(doc(db, 'users', userId, 'exterior-info', data.ticker.toUpperCase()), data)

export const subscribeToExteriorInfo = (
  userId: string,
  cb: (data: Record<string, ExteriorInfo>) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'exterior-info'), (snap) => {
    const records: Record<string, ExteriorInfo> = {}
    snap.docs.forEach((d) => {
      records[d.id] = d.data() as ExteriorInfo
    })
    cb(records)
  })

/* ─── Firestore – monthly snapshot upsert ──────────────────────── */

const currentMonth = () => new Date().toISOString().slice(0, 7) // "2025-04"

export const upsertMonthlySnapshot = (
  userId: string,
  ticker: string,
  partial: Partial<FundamentalSnapshot>,
  existing: FundamentalRecord | null,
  currentPrice?: number,
) => {
  const month = currentMonth()
  const now = new Date().toISOString()

  // upsert snapshot
  const prev = existing?.snapshots ?? []
  const idx = prev.findIndex((s) => s.fetchedAt.startsWith(month))
  const base: FundamentalSnapshot = {
    fetchedAt: now,
    priceEarnings: null,
    priceToBook: null,
    returnOnEquity: null,
    profitMargins: null,
    debtToEquity: null,
    dividendYield: null,
    earningsGrowth: null,
    revenueGrowth: null,
    grossMargins: null,
    ebitdaMargins: null,
    returnOnAssets: null,
    sector: null,
    industry: null,
  }
  const merged: FundamentalSnapshot =
    idx >= 0 ? { ...prev[idx], ...partial, fetchedAt: now } : { ...base, ...partial }
  const snapshots = (
    idx >= 0 ? prev.map((s, i) => (i === idx ? merged : s)) : [...prev, merged]
  ).slice(-MAX_MONTHS)

  // upsert monthly price point
  const prevPrices = existing?.priceHistory ?? []
  let priceHistory = prevPrices
  if (currentPrice !== undefined) {
    const priceIdx = prevPrices.findIndex((p) => p.date.startsWith(month))
    const point: PricePoint = { date: now.slice(0, 10), close: currentPrice }
    priceHistory = (
      priceIdx >= 0
        ? prevPrices.map((p, i) => (i === priceIdx ? point : p))
        : [...prevPrices, point]
    ).slice(-MAX_MONTHS)
  }

  const record: FundamentalRecord = {
    ticker,
    updatedAt: now,
    snapshots,
    priceHistory,
  }

  return setDoc(doc(db, 'users', userId, 'fundamentals', ticker.toUpperCase()), record)
}

export const deleteSnapshotFromRecord = (
  userId: string,
  ticker: string,
  fetchedAt: string,
  existing: FundamentalRecord,
) => {
  const snapshots = existing.snapshots.filter((s) => s.fetchedAt !== fetchedAt)
  const record: FundamentalRecord = { ...existing, snapshots, updatedAt: new Date().toISOString() }
  return setDoc(doc(db, 'users', userId, 'fundamentals', ticker.toUpperCase()), record)
}

export const subscribeToFundamentals = (
  userId: string,
  cb: (records: Record<string, FundamentalRecord>) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'fundamentals'), (snap) => {
    const records: Record<string, FundamentalRecord> = {}
    snap.docs.forEach((d) => {
      records[d.id] = d.data() as FundamentalRecord
    })
    cb(records)
  })

export const saveFiiManualData = (userId: string, data: FiiManualData) =>
  setDoc(doc(db, 'users', userId, 'fii-manual', data.ticker.toUpperCase()), data)

export const subscribeToFiiManual = (
  userId: string,
  cb: (data: Record<string, FiiManualData>) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'fii-manual'), (snap) => {
    const records: Record<string, FiiManualData> = {}
    snap.docs.forEach((d) => {
      records[d.id] = d.data() as FiiManualData
    })
    cb(records)
  })
