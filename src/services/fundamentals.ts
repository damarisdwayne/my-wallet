import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { FiiInfo, FiiManualData, FundamentalRecord, FundamentalSnapshot, PricePoint } from '@/types'


const MAX_MONTHS = 12

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

export const subscribeToFiiInfo = (
  userId: string,
  cb: (data: Record<string, FiiInfo>) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'fii-info'), (snap) => {
    const records: Record<string, FiiInfo> = {}
    snap.docs.forEach((d) => {
      records[d.id] = d.data() as FiiInfo
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
