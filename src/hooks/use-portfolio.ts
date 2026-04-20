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
  saveFiiManualData,
  subscribeToFiiManual,
  subscribeToFundamentals,
  upsertMonthlySnapshot,
} from '@/services/fundamentals'
import { deleteImportRecord, saveImportRecord, subscribeToImports } from '@/services/imports'
import { clearQuoteCache, fetchLivePrices } from '@/services/quotes'
import { useAuth } from '@/store/auth'
import type {
  Asset,
  AssetAnswers,
  Diagram,
  FiiManualData,
  FundamentalRecord,
  ImportItem,
  ImportRecord,
  PortfolioCategory,
} from '@/types'
import type { B3Asset } from '@/services/b3-import'

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

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
  const [loading, setLoading] = useState(true)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [fundamentals, setFundamentals] = useState<Record<string, FundamentalRecord>>({})
  const [fiiManual, setFiiManual] = useState<Record<string, FiiManualData>>({})
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
        setAssets(data)
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

  const importFromB3 = async (b3Assets: B3Asset[], filename: string) => {
    if (!user) return
    const items: ImportItem[] = []

    await Promise.all(
      b3Assets.map(async (b3) => {
        const existing = assets.find((a) => a.ticker.toUpperCase() === b3.ticker)

        if (existing) {
          const prevQty = existing.quantity
          const prevAvg = existing.avgPrice
          const newQty = prevQty + b3.quantity

          // Only update avgPrice when net buying; selling keeps the existing PM
          const newAvg =
            b3.quantity > 0 ? (prevQty * prevAvg + b3.quantity * b3.avgPrice) / newQty : prevAvg

          await updateAssetService(user.uid, existing.id, {
            quantity: newQty,
            avgPrice: newAvg,
            currentPrice: b3.currentPrice,
          })

          items.push({
            assetId: existing.id,
            ticker: b3.ticker,
            quantityDelta: b3.quantity,
            importAvgPrice: b3.avgPrice,
            previousQuantity: prevQty,
            previousAvgPrice: prevAvg,
            wasCreated: false,
          })
        } else {
          const autoCatId = categories.find((c) => c.type === b3.type)?.id ?? ''
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

    const record: ImportRecord = {
      id: `import-${Date.now()}`,
      filename,
      importedAt: new Date().toISOString(),
      items,
    }
    await saveImportRecord(user.uid, record)
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
          await updateAssetService(user.uid, item.assetId, {
            quantity: item.previousQuantity,
            avgPrice: item.previousAvgPrice,
          })
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

  const saveManualSnapshot = async (ticker: string, partial: Partial<import('@/types').FundamentalSnapshot>) => {
    if (!user) return
    const existing = fundamentals[ticker.toUpperCase()] ?? null
    const asset = assets.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase())
    await upsertMonthlySnapshot(user.uid, ticker, partial, existing, asset?.currentPrice)
  }

  const saveFiiManual = (data: FiiManualData) => {
    if (!user) return Promise.resolve()
    return saveFiiManualData(user.uid, data)
  }

  const refreshPrices = async () => {
    if (!user || assets.length === 0) return
    setRefreshingPrices(true)
    setPriceError(null)
    clearQuoteCache()
    try {
      const priceable = assets.filter((a) => a.type !== 'fixed_income' && a.type !== 'other')
      const prices = await fetchLivePrices(
        priceable.map((a) => ({ ticker: a.ticker, type: a.type })),
      )
      await Promise.all(
        priceable
          .filter((a) => prices[a.ticker.toUpperCase()] !== undefined)
          .map((a) => updateAssetPriceService(user.uid, a.id, prices[a.ticker.toUpperCase()])),
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
    addAsset,
    importFromB3,
    revertImport,
    editAsset,
    saveCategory,
    deleteCategory,
    saveDiagram,
    saveAnswers,
    refreshPrices,
    refreshingPrices,
    priceError,
    fundamentals,
    fiiManual,
    refreshingFundamentals,
    fundamentalErrors,
    refreshFundamentals,
    saveManualSnapshot,
    saveFiiManual,
  }
}
