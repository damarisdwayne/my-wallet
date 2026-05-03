import { useEffect, useRef, useState } from 'react'
import {
  addAsset as addAssetService,
  deleteAsset as deleteAssetService,
  updateAsset as updateAssetService,
} from '@/services/assets'
import { saveAnswers as saveAnswersService, subscribeToAnswers } from '@/services/answers'
import {
  deleteCategory as deleteCategoryService,
  saveCategory as saveCategoryService,
  subscribeToCategories,
} from '@/services/categories'
import { saveDiagram as saveDiagramService, subscribeToDiagrams } from '@/services/diagrams'
import { deleteImportRecord, saveImportRecord, subscribeToImports } from '@/services/imports'
import { addTrades, deleteTrade as deleteTradeService, subscribeToTrades } from '@/services/trades'
import { useAuth } from '@/store/auth'
import type {
  AssetAnswers,
  Diagram,
  ImportItem,
  ImportRecord,
  PortfolioCategory,
  Trade,
} from '@/types'
import type { B3Asset, B3Dividend, B3RawTrade } from '@/services/b3-import'
import { addDividends } from '@/services/dividends'
import { useAssets } from './use-assets'
import { useFundamentals } from './use-fundamentals'
import { toast } from 'sonner'

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
  const uid = user?.uid ?? null

  const assetsHook = useAssets(uid)
  const fundamentalsHook = useFundamentals(uid)

  const { assets } = assetsHook

  const [categories, setCategories] = useState<PortfolioCategory[]>([])
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [answers, setAnswers] = useState<Record<string, AssetAnswers>>({})
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const seededRef = useRef(false)

  // Track when all 5 sources have loaded: assets + categories + diagrams + answers + imports
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [diagramsLoaded, setDiagramsLoaded] = useState(false)
  const [answersLoaded, setAnswersLoaded] = useState(false)
  const [importsLoaded, setImportsLoaded] = useState(false)

  useEffect(() => {
    if (assetsHook.loaded && categoriesLoaded && diagramsLoaded && answersLoaded && importsLoaded) {
      setLoading(false)
    }
  }, [assetsHook.loaded, categoriesLoaded, diagramsLoaded, answersLoaded, importsLoaded])

  useEffect(() => {
    if (!uid) return
    const unsubs = [
      subscribeToCategories(uid, (data) => {
        if (data.length === 0 && !seededRef.current) {
          seededRef.current = true
          makeDefaultCategories().forEach((cat) => saveCategoryService(uid, cat))
        }
        setCategories(data)
        setCategoriesLoaded(true)
      }),
      subscribeToDiagrams(uid, (data) => {
        setDiagrams(data)
        setDiagramsLoaded(true)
      }),
      subscribeToAnswers(uid, (data) => {
        setAnswers(data)
        setAnswersLoaded(true)
      }),
      subscribeToImports(uid, (data) => {
        setImportRecords(data)
        setImportsLoaded(true)
      }),
      subscribeToTrades(uid, setTrades),
    ]
    return () => unsubs.forEach((u) => u())
  }, [uid])

  const saveCategory = async (cat: PortfolioCategory) => {
    if (!uid) return
    try {
      await saveCategoryService(uid, cat)
    } catch {
      toast.error('Erro ao salvar categoria')
    }
  }

  const deleteCategory = async (catId: string) => {
    if (!uid) return
    try {
      await deleteCategoryService(uid, catId)
    } catch {
      toast.error('Erro ao excluir categoria')
    }
  }

  const saveDiagram = (diagram: Diagram) =>
    uid ? saveDiagramService(uid, diagram) : Promise.resolve()

  const saveAnswers = (assetId: string, assetAnswers: AssetAnswers) =>
    uid ? saveAnswersService(uid, assetId, assetAnswers) : Promise.resolve()

  const importFromB3 = async (
    b3Assets: B3Asset[],
    rawTrades: B3RawTrade[],
    dividends: B3Dividend[],
    filename: string,
    source?: 'b3' | 'inter',
  ) => {
    if (!uid) return
    try {
      const items: ImportItem[] = []

      await Promise.all(
        b3Assets.map(async (b3) => {
          const existing = assets.find((a) => a.ticker.toUpperCase() === b3.ticker)

          if (existing) {
            const prevQty = existing.quantity
            const prevAvg = existing.avgPrice
            const newQty = Math.max(0, prevQty + b3.quantity)

            if (newQty === 0) {
              await deleteAssetService(uid, existing.id)
            } else {
              // PM only changes on buys; sells don't affect average cost
              const newAvg =
                b3.boughtQty > 0
                  ? (prevQty * prevAvg + b3.boughtQty * b3.avgPrice) / (prevQty + b3.boughtQty)
                  : prevAvg
              await updateAssetService(uid, existing.id, {
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
            const newAsset = {
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
            await addAssetService(uid, newAsset)
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
        saveImportRecord(uid, record),
        rawTrades.length > 0 &&
          addTrades(
            uid,
            rawTrades.map((t) => ({ ...t, source: 'b3_import' as const, importId })),
          ),
        dividends.length > 0 && addDividends(uid, dividends),
      ])
      toast.success('Importação concluída')
    } catch {
      toast.error('Erro na importação')
    }
  }

  const addManualTrade = async (trade: Omit<Trade, 'id' | 'source'>) => {
    if (!uid) return
    try {
      await addTrades(uid, [{ ...trade, source: 'manual' as const }])

      const existing = assets.find((a) => a.ticker.toUpperCase() === trade.ticker.toUpperCase())
      if (existing) {
        const newQty =
          trade.type === 'buy'
            ? existing.quantity + trade.quantity
            : Math.max(0, existing.quantity - trade.quantity)

        if (newQty === 0) {
          await deleteAssetService(uid, existing.id)
        } else {
          const newAvg =
            trade.type === 'buy'
              ? (existing.quantity * existing.avgPrice + trade.quantity * trade.price) /
                (existing.quantity + trade.quantity)
              : existing.avgPrice
          await updateAssetService(uid, existing.id, { quantity: newQty, avgPrice: newAvg })
        }
      } else if (trade.type === 'buy') {
        const newAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ticker: trade.ticker.toUpperCase(),
          name: trade.ticker.toUpperCase(),
          type: 'stock' as const,
          categoryId: '',
          quantity: trade.quantity,
          avgPrice: trade.price,
          currentPrice: trade.price,
          targetPercent: 0,
        }
        await addAssetService(uid, newAsset)
      }
    } catch {
      toast.error('Erro ao registrar operação')
    }
  }

  const revertImport = async (record: ImportRecord) => {
    if (!uid) return
    try {
      await Promise.all(
        record.items.map(async (item) => {
          if (item.wasCreated) {
            await deleteAssetService(uid, item.assetId)
          } else {
            const stillExists = assets.some((a) => a.id === item.assetId)
            if (stillExists) {
              await updateAssetService(uid, item.assetId, {
                quantity: item.previousQuantity,
                avgPrice: item.previousAvgPrice,
              })
            }
          }
        }),
      )
      await deleteImportRecord(uid, record.id)
      toast.success('Importação revertida')
    } catch {
      toast.error('Erro ao reverter importação')
    }
  }

  const syncMissingTrades = async () => {
    if (!uid) return
    const today = new Date().toISOString().slice(0, 10)
    const tickersWithTrades = new Set(trades.map((t) => t.ticker.toUpperCase()))
    const missing = assets.filter((a) => !tickersWithTrades.has(a.ticker.toUpperCase()))
    if (missing.length === 0) return
    await addTrades(
      uid,
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

  // Wrap fundamentals actions that need assets from this hook
  const refreshFundamentals = (tickers: string[]) =>
    fundamentalsHook.refreshFundamentals(tickers, assets)

  const saveManualSnapshot = (
    ticker: string,
    partial: Partial<import('@/types').FundamentalSnapshot>,
    priceOverride?: number,
  ) => fundamentalsHook.saveManualSnapshot(ticker, partial, priceOverride, assets)

  return {
    loading,
    assets,
    categories,
    diagrams,
    answers,
    importRecords,
    trades,
    addAsset: assetsHook.addAsset,
    addManualTrade,
    deleteTrade: (tradeId: string) => (uid ? deleteTradeService(uid, tradeId) : Promise.resolve()),
    importFromB3,
    revertImport,
    editAsset: assetsHook.editAsset,
    deleteAsset: assetsHook.deleteAsset,
    saveCategory,
    deleteCategory,
    saveDiagram,
    saveAnswers,
    refreshPrices: assetsHook.refreshPrices,
    refreshingPrices: assetsHook.refreshingPrices,
    priceError: assetsHook.priceError,
    fundamentals: fundamentalsHook.fundamentals,
    fiiManual: fundamentalsHook.fiiManual,
    fiiInfo: fundamentalsHook.fiiInfo,
    saveFiiInfo: fundamentalsHook.saveFiiInfo,
    stockInfo: fundamentalsHook.stockInfo,
    saveStockInfo: fundamentalsHook.saveStockInfo,
    refreshingFundamentals: fundamentalsHook.refreshingFundamentals,
    fundamentalErrors: fundamentalsHook.fundamentalErrors,
    refreshFundamentals,
    saveManualSnapshot,
    saveFiiManual: fundamentalsHook.saveFiiManual,
    syncMissingTrades,
  }
}
