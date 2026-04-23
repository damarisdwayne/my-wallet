import { useEffect, useRef, useState } from 'react'
import {
  addAsset as addAssetService,
  subscribeToAssets,
  updateAsset as updateAssetService,
  updateAssetPrice as updateAssetPriceService,
} from '@/services/assets'
import { saveAnswers as saveAnswersService, subscribeToAnswers } from '@/services/answers'
import {
  deleteCategory as deleteCategoryService,
  saveCategory as saveCategoryService,
  subscribeToCategories,
} from '@/services/categories'
import { saveDiagram as saveDiagramService, subscribeToDiagrams } from '@/services/diagrams'
import {
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
import { deleteImportRecord, saveImportRecord, subscribeToImports } from '@/services/imports'
import { addTrades, deleteTrade as deleteTradeService, subscribeToTrades } from '@/services/trades'
import { calcFixedIncomeValue } from '@/services/bcb-rates'
import { clearQuoteCache, fetchLivePrices } from '@/services/quotes'
import { useAuth } from '@/store/auth'
import type {
  Asset,
  AssetAnswers,
  Diagram,
  FiiInfo,
  FiiManualData,
  FundamentalRecord,
  ImportItem,
  ImportRecord,
  PortfolioCategory,
  StockInfo,
  Trade,
} from '@/types'
import type { B3Asset, B3Dividend, B3RawTrade } from '@/services/b3-import'
import { addDividends } from '@/services/dividends'

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const deleteExpiredAssets = async (uid: string, assets: Asset[]) => {
  const { deleteDoc, doc } = await import('firebase/firestore')
  const { db } = await import('@/lib/firestore')
  await Promise.all(assets.map((a) => deleteDoc(doc(db, 'users', uid, 'assets', a.id))))
}

const makeDefaultCategories = (): PortfolioCategory[] => [
  { id: mkId(), name: 'Fundos Imobiliários', type: 'fii', targetPercent: 30, color: '#f97316' },
  { id: mkId(), name: 'Renda Fixa', type: 'fixed_income', targetPercent: 30, color: '#3b82f6' },
  { id: mkId(), name: 'Bolsa BR', type: 'stock', targetPercent: 20, color: '#22c55e' },
  { id: mkId(), name: 'Exterior', type: 'stock_us', targetPercent: 17, color: '#8b5cf6' },
  { id: mkId(), name: 'Cripto', type: 'crypto', targetPercent: 3, color: '#eab308' },
]

export const usePortfolio = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<PortfolioCategory[]>([])
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [answers, setAnswers] = useState<Record<string, AssetAnswers>>({})
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [fundamentals, setFundamentals] = useState<Record<string, FundamentalRecord>>({})
  const [fiiManual, setFiiManual] = useState<Record<string, FiiManualData>>({})
  const [fiiInfo, setFiiInfo] = useState<Record<string, FiiInfo>>({})
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({})
  const [refreshingFundamentals, setRefreshingFundamentals] = useState<Record<string, boolean>>({})
  const [fundamentalErrors, setFundamentalErrors] = useState<Record<string, string>>({})
  const seededRef = useRef(false)

  useEffect(() => {
    if (!user) return
    let resolved = 0
    const onLoad = () => {
      resolved++
      if (resolved === 5) setLoading(false)
    }
    const unsubs = [
      subscribeToAssets(user.uid, (data) => {
        const today = new Date().toISOString().slice(0, 10)
        const expired = data.filter(
          (a) => a.type === 'fixed_income' && a.maturityDate && a.maturityDate < today,
        )
        if (expired.length > 0) void deleteExpiredAssets(user.uid, expired)
        setAssets(data.filter((a) => !expired.some((e) => e.id === a.id)))
        onLoad()
      }),
      subscribeToCategories(user.uid, (data) => {
        if (data.length === 0 && !seededRef.current) {
          seededRef.current = true
          makeDefaultCategories().forEach((cat) => saveCategoryService(user.uid, cat))
        }
        setCategories(data)
        onLoad()
      }),
      subscribeToDiagrams(user.uid, (data) => {
        setDiagrams(data)
        onLoad()
      }),
      subscribeToAnswers(user.uid, (data) => {
        setAnswers(data)
        onLoad()
      }),
      subscribeToImports(user.uid, (data) => {
        setImportRecords(data)
        onLoad()
      }),
      subscribeToFundamentals(user.uid, setFundamentals),
      subscribeToFiiManual(user.uid, setFiiManual),
      subscribeToFiiInfo(user.uid, setFiiInfo),
      subscribeToTrades(user.uid, setTrades),
      subscribeToStockInfo(user.uid, setStockInfo),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const addAsset = (asset: Asset) => {
    if (!user) return Promise.resolve()
    return addAssetService(user.uid, asset)
  }

  const editAsset = (assetId: string, data: Partial<Asset>) => {
    if (!user) return Promise.resolve()
    return updateAssetService(user.uid, assetId, data)
  }

  const deleteAsset = async (assetId: string) => {
    if (!user) return
    const { deleteDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firestore')
    await deleteDoc(doc(db, 'users', user.uid, 'assets', assetId))
  }

  const saveCategory = (cat: PortfolioCategory) => {
    if (!user) return Promise.resolve()
    return saveCategoryService(user.uid, cat)
  }

  const deleteCategory = (catId: string) => {
    if (!user) return Promise.resolve()
    return deleteCategoryService(user.uid, catId)
  }

  const saveDiagram = (diagram: Diagram) => {
    if (!user) return Promise.resolve()
    return saveDiagramService(user.uid, diagram)
  }

  const saveAnswers = (assetId: string, assetAnswers: AssetAnswers) => {
    if (!user) return Promise.resolve()
    return saveAnswersService(user.uid, assetId, assetAnswers)
  }

  const importFromB3 = async (
    b3Assets: B3Asset[],
    rawTrades: B3RawTrade[],
    dividends: B3Dividend[],
    filename: string,
    source?: 'b3' | 'inter',
  ) => {
    if (!user) return
    const items: ImportItem[] = []

    await Promise.all(
      b3Assets.map(async (b3) => {
        const existing = assets.find((a) => a.ticker.toUpperCase() === b3.ticker)

        if (existing) {
          const prevQty = existing.quantity
          const prevAvg = existing.avgPrice
          const newQty = Math.max(0, prevQty + b3.quantity)

          if (newQty === 0) {
            const { deleteDoc, doc } = await import('firebase/firestore')
            const { db } = await import('@/lib/firestore')
            await deleteDoc(doc(db, 'users', user.uid, 'assets', existing.id))
          } else {
            // PM only changes on buys; sells don't affect average cost
            const newAvg =
              b3.boughtQty > 0
                ? (prevQty * prevAvg + b3.boughtQty * b3.avgPrice) / (prevQty + b3.boughtQty)
                : prevAvg
            await updateAssetService(user.uid, existing.id, {
              quantity: newQty,
              avgPrice: newAvg,
              currentPrice: b3.currentPrice > 0 ? b3.currentPrice : existing.currentPrice,
            })
          }

          items.push({
            assetId: existing.id,
            ticker: b3.ticker,
            quantityDelta: b3.quantity,
            importAvgPrice: b3.avgPrice,
            previousQuantity: prevQty,
            previousAvgPrice: prevAvg,
            wasCreated: false,
          })
        } else if (b3.quantity > 0) {
          // Inter imports: ETFs are US-listed → use the Exterior (stock_us) category
          const catType = source === 'inter' && b3.type === 'etf' ? 'stock_us' : b3.type
          const autoCatId = categories.find((c) => c.type === catType)?.id ?? ''
          const firstBuyDate =
            b3.operationDate ??
            rawTrades
              .filter((t) => t.ticker === b3.ticker && t.type === 'buy' && t.date)
              .sort((a, b) => a.date.localeCompare(b.date))[0]?.date
          const newAsset: Asset = {
            id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ticker: b3.ticker,
            name: b3.name,
            type: b3.type,
            categoryId: autoCatId,
            quantity: b3.quantity,
            avgPrice: b3.avgPrice,
            currentPrice: b3.currentPrice,
            targetPercent: 0,
            ...(firstBuyDate ? { operationDate: firstBuyDate } : {}),
          }
          await addAssetService(user.uid, newAsset)
          items.push({
            assetId: newAsset.id,
            ticker: b3.ticker,
            quantityDelta: b3.quantity,
            importAvgPrice: b3.avgPrice,
            previousQuantity: 0,
            previousAvgPrice: 0,
            wasCreated: true,
          })
        }
      }),
    )

    const importId = `import-${Date.now()}`
    const record: ImportRecord = {
      id: importId,
      filename,
      importedAt: new Date().toISOString(),
      items,
    }
    await Promise.all([
      saveImportRecord(user.uid, record),
      rawTrades.length > 0 &&
        addTrades(
          user.uid,
          rawTrades.map((t) => ({ ...t, source: 'b3_import' as const, importId })),
        ),
      dividends.length > 0 && addDividends(user.uid, dividends),
    ])
  }

  const addManualTrade = async (trade: Omit<Trade, 'id' | 'source'>) => {
    if (!user) return
    await addTrades(user.uid, [{ ...trade, source: 'manual' as const }])

    const existing = assets.find((a) => a.ticker.toUpperCase() === trade.ticker.toUpperCase())
    if (existing) {
      const newQty =
        trade.type === 'buy'
          ? existing.quantity + trade.quantity
          : Math.max(0, existing.quantity - trade.quantity)

      if (newQty === 0) {
        const { deleteDoc, doc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firestore')
        await deleteDoc(doc(db, 'users', user.uid, 'assets', existing.id))
      } else {
        const newAvg =
          trade.type === 'buy'
            ? (existing.quantity * existing.avgPrice + trade.quantity * trade.price) /
              (existing.quantity + trade.quantity)
            : existing.avgPrice
        await updateAssetService(user.uid, existing.id, { quantity: newQty, avgPrice: newAvg })
      }
    } else if (trade.type === 'buy') {
      const newAsset: Asset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ticker: trade.ticker.toUpperCase(),
        name: trade.ticker.toUpperCase(),
        type: 'stock',
        categoryId: '',
        quantity: trade.quantity,
        avgPrice: trade.price,
        currentPrice: trade.price,
        targetPercent: 0,
      }
      await addAssetService(user.uid, newAsset)
    }
  }

  const revertImport = async (record: ImportRecord) => {
    if (!user) return
    await Promise.all(
      record.items.map(async (item) => {
        if (item.wasCreated) {
          const { deleteDoc, doc } = await import('firebase/firestore')
          const { db } = await import('@/lib/firestore')
          await deleteDoc(doc(db, 'users', user.uid, 'assets', item.assetId))
        } else {
          const stillExists = assets.some((a) => a.id === item.assetId)
          if (stillExists) {
            await updateAssetService(user.uid, item.assetId, {
              quantity: item.previousQuantity,
              avgPrice: item.previousAvgPrice,
            })
          }
        }
      }),
    )
    await deleteImportRecord(user.uid, record.id)
  }

  const refreshFundamentals = async (tickers: string[]) => {
    if (!user || tickers.length === 0) return
    setRefreshingFundamentals(Object.fromEntries(tickers.map((t) => [t, true])))
    const errors: Record<string, string> = {}
    await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const existing = fundamentals[ticker.toUpperCase()] ?? null
          const asset = assets.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase())
          const brapi = await fetchBrapiSummary(ticker)
          await upsertMonthlySnapshot(
            user.uid,
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
    partial: Partial<import('@/types').FundamentalSnapshot>,
    priceOverride?: number,
  ) => {
    if (!user) return
    const existing = fundamentals[ticker.toUpperCase()] ?? null
    const asset = assets.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase())
    await upsertMonthlySnapshot(
      user.uid,
      ticker,
      partial,
      existing,
      priceOverride ?? asset?.currentPrice,
    )
  }

  const saveFiiManual = (data: FiiManualData) => {
    if (!user) return Promise.resolve()
    return saveFiiManualData(user.uid, data)
  }

  const saveFiiInfo = (data: FiiInfo) => {
    if (!user) return Promise.resolve()
    return saveFiiInfoService(user.uid, data)
  }

  const saveStockInfo = (data: StockInfo) => {
    if (!user) return Promise.resolve()
    return saveStockInfoService(user.uid, data)
  }

  const syncMissingTrades = async () => {
    if (!user) return
    const today = new Date().toISOString().slice(0, 10)
    const tickersWithTrades = new Set(trades.map((t) => t.ticker.toUpperCase()))
    const missing = assets.filter((a) => !tickersWithTrades.has(a.ticker.toUpperCase()))
    if (missing.length === 0) return
    await addTrades(
      user.uid,
      missing.map((a) => ({
        ticker: a.ticker,
        type: 'buy' as const,
        quantity: a.quantity,
        price: a.avgPrice,
        total: a.avgPrice * a.quantity,
        date: a.operationDate ?? today,
        source: 'manual' as const,
      })),
    )
  }

  const refreshPrices = async () => {
    if (!user || assets.length === 0) return
    setRefreshingPrices(true)
    setPriceError(null)
    clearQuoteCache()
    try {
      // Stocks, FIIs, ETFs, BDRs, crypto
      const priceable = assets.filter((a) => a.type !== 'fixed_income' && a.type !== 'other')
      const prices = await fetchLivePrices(
        priceable.map((a) => ({ ticker: a.ticker, type: a.type })),
      )
      await Promise.all(
        priceable
          .filter((a) => prices[a.ticker.toUpperCase()] !== undefined)
          .map((a) => updateAssetPriceService(user.uid, a.id, prices[a.ticker.toUpperCase()])),
      )

      // Flat fixed income (CDB, LCI, LCA…) — calculate via BCB rates API
      const flatFI = assets.filter(
        (a) => a.type === 'fixed_income' && !a.ticker.toUpperCase().startsWith('TESOURO'),
      )
      await Promise.all(
        flatFI
          .filter((a) => a.operationDate && a.rateType)
          .map(async (a) => {
            const rateType = a.rateType ?? ''
            const operationDate = a.operationDate ?? ''
            const newValue = await calcFixedIncomeValue(
              a.avgPrice,
              rateType,
              a.indexerRate,
              a.prefixedRate,
              operationDate,
            )
            if (Math.abs(newValue - a.currentPrice) > 0.01) {
              await updateAssetPriceService(user.uid, a.id, newValue)
            }
          }),
      )
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : 'Erro ao atualizar preços')
    } finally {
      setRefreshingPrices(false)
    }
  }

  return {
    loading,
    assets,
    categories,
    diagrams,
    answers,
    importRecords,
    trades,
    addAsset,
    addManualTrade,
    deleteTrade: (tradeId: string) =>
      user ? deleteTradeService(user.uid, tradeId) : Promise.resolve(),
    importFromB3,
    revertImport,
    editAsset,
    deleteAsset,
    saveCategory,
    deleteCategory,
    saveDiagram,
    saveAnswers,
    refreshPrices,
    refreshingPrices,
    priceError,
    fundamentals,
    fiiManual,
    fiiInfo,
    saveFiiInfo,
    stockInfo,
    saveStockInfo,
    refreshingFundamentals,
    fundamentalErrors,
    refreshFundamentals,
    saveManualSnapshot,
    saveFiiManual,
    syncMissingTrades,
  }
}
