import { useEffect, useState } from 'react'
import {
  deleteSnapshotFromRecord,
  fetchBrapiSummary,
  saveFiiInfo as saveFiiInfoService,
  saveFiiManualData,
  saveStockInfo as saveStockInfoService,
  subscribeToFiiInfo,
  subscribeToFiiManual,
  subscribeToFundamentals,
  subscribeToStockInfo,
  upsertMonthlySnapshot,
} from '@/services/fundamentals'
import type {
  Asset,
  FiiInfo,
  FiiManualData,
  FundamentalRecord,
  FundamentalSnapshot,
  StockInfo,
} from '@/types'

export const useFundamentals = (uid: string | null) => {
  const [fundamentals, setFundamentals] = useState<Record<string, FundamentalRecord>>({})
  const [fiiManual, setFiiManual] = useState<Record<string, FiiManualData>>({})
  const [fiiInfo, setFiiInfo] = useState<Record<string, FiiInfo>>({})
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({})
  const [refreshingFundamentals, setRefreshingFundamentals] = useState<Record<string, boolean>>({})
  const [fundamentalErrors, setFundamentalErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!uid) return
    const unsubs = [
      subscribeToFundamentals(uid, setFundamentals),
      subscribeToFiiManual(uid, setFiiManual),
      subscribeToFiiInfo(uid, setFiiInfo),
      subscribeToStockInfo(uid, setStockInfo),
    ]
    return () => unsubs.forEach((u) => u())
  }, [uid])

  const refreshFundamentals = async (tickers: string[], assets: Asset[]) => {
    if (!uid || tickers.length === 0) return
    setRefreshingFundamentals(Object.fromEntries(tickers.map((t) => [t, true])))
    const errors: Record<string, string> = {}
    await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const existing = fundamentals[ticker.toUpperCase()] ?? null
          const asset = assets.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase())
          const brapi = await fetchBrapiSummary(ticker)
          await upsertMonthlySnapshot(
            uid,
            ticker,
            { priceEarnings: brapi.priceEarnings, sector: brapi.sector, industry: brapi.industry },
            existing,
            asset?.currentPrice,
          )
        } catch (err) {
          errors[ticker] = err instanceof Error ? err.message : 'Erro'
        }
      }),
    )
    setFundamentalErrors(errors)
    setRefreshingFundamentals({})
  }

  const saveManualSnapshot = async (
    ticker: string,
    partial: Partial<FundamentalSnapshot>,
    priceOverride: number | undefined,
    assets: Asset[],
  ) => {
    if (!uid) return
    const existing = fundamentals[ticker.toUpperCase()] ?? null
    const asset = assets.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase())
    await upsertMonthlySnapshot(
      uid,
      ticker,
      partial,
      existing,
      priceOverride ?? asset?.currentPrice,
    )
  }

  const saveFiiManual = (data: FiiManualData) =>
    uid ? saveFiiManualData(uid, data) : Promise.resolve()

  const saveFiiInfo = (data: FiiInfo) => (uid ? saveFiiInfoService(uid, data) : Promise.resolve())

  const saveStockInfo = (data: StockInfo) =>
    uid ? saveStockInfoService(uid, data) : Promise.resolve()

  const deleteSnapshot = (ticker: string, fetchedAt: string) => {
    if (!uid) return Promise.resolve()
    const existing = fundamentals[ticker.toUpperCase()]
    if (!existing) return Promise.resolve()
    return deleteSnapshotFromRecord(uid, ticker, fetchedAt, existing)
  }

  return {
    fundamentals,
    fiiManual,
    fiiInfo,
    stockInfo,
    refreshingFundamentals,
    fundamentalErrors,
    refreshFundamentals,
    saveManualSnapshot,
    saveFiiManual,
    saveFiiInfo,
    saveStockInfo,
    deleteSnapshot,
  }
}
