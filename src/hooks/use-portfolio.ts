import { useEffect, useRef, useState } from 'react'
import { useSetAtom } from 'jotai'
import { portfolioContextAtom } from '@/store/portfolio-context'
import type { PortfolioContextData } from '@/store/portfolio-context'
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
import {
  deleteDiagram as deleteDiagramService,
  saveDiagram as saveDiagramService,
  subscribeToDiagrams,
} from '@/services/diagrams'
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
  {
    id: mkId(),
    name: 'Fundos Imobiliários',
    assetTypes: ['fii'],
    targetPercent: 30,
    color: '#f97316',
    tracking: 'goal',
  },
  {
    id: mkId(),
    name: 'Renda Fixa',
    assetTypes: ['fixed_income', 'tesouro'],
    targetPercent: 30,
    color: '#3b82f6',
    tracking: 'goal',
  },
  {
    id: mkId(),
    name: 'Bolsa BR',
    assetTypes: ['stock', 'bdr', 'etf'],
    targetPercent: 20,
    color: '#22c55e',
    tracking: 'goal',
  },
  {
    id: mkId(),
    name: 'Exterior',
    assetTypes: ['stock_us', 'etf_us'],
    targetPercent: 17,
    color: '#8b5cf6',
    tracking: 'goal',
  },
  {
    id: mkId(),
    name: 'Cripto',
    assetTypes: ['crypto'],
    targetPercent: 3,
    color: '#eab308',
    tracking: 'goal',
  },
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

  const setPortfolioContext = useSetAtom(portfolioContextAtom)

  useEffect(() => {
    if (assetsHook.loaded && categoriesLoaded && diagramsLoaded && answersLoaded && importsLoaded) {
      setLoading(false)
      void assetsHook.refreshPricesIfStale()
    }
  }, [assetsHook.loaded, categoriesLoaded, diagramsLoaded, answersLoaded, importsLoaded])

  useEffect(() => {
    if (loading || assets.length === 0) return
    const totalValue = assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
    const totalInvested = assets.reduce((s, a) => s + a.avgPrice * a.quantity, 0)
    const returnPercent =
      totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

    const contextData: PortfolioContextData = {
      totalValue,
      totalInvested,
      returnPercent,
      assets: assets.map((a) => ({
        ticker: a.ticker,
        name: a.name,
        type: a.type,
        currentPrice: a.currentPrice,
        quantity: a.quantity,
        avgPrice: a.avgPrice,
        totalValue: a.currentPrice * a.quantity,
        returnPercent: a.avgPrice > 0 ? ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100 : 0,
        maturityDate: a.maturityDate,
        fixedIncomeType: a.fixedIncomeType,
        institution: a.institution,
        rateType: a.rateType,
        indexerRate: a.indexerRate,
        prefixedRate: a.prefixedRate,
      })),
      categories: categories.map((c) => {
        const catAssets = assets.filter((a) => a.categoryId === c.id)
        const currentValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
        return {
          name: c.name,
          targetPercent: c.targetPercent,
          currentValue,
          currentPercent: totalValue > 0 ? (currentValue / totalValue) * 100 : 0,
        }
      }),
    }
    setPortfolioContext(contextData)
  }, [loading, assets, categories, setPortfolioContext])

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

  const deleteDiagram = (diagramId: string) =>
    uid ? deleteDiagramService(uid, diagramId) : Promise.resolve()

  const saveAnswers = (assetId: string, assetAnswers: AssetAnswers) =>
    uid ? saveAnswersService(uid, assetId, assetAnswers) : Promise.resolve()

  const importFromB3 = async (
    b3Assets: B3Asset[],
    rawTrades: B3RawTrade[],
    dividends: B3Dividend[],
    filename: string,
    _source?: 'b3' | 'inter',
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
            const autoCatId = categories.find((c) => c.assetTypes.includes(b3.type))?.id ?? ''
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

  const recordTrade = async (trade: Omit<Trade, 'id' | 'source'>): Promise<void> => {
    if (uid) await addTrades(uid, [{ ...trade, source: 'manual' as const }])
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
      // Delete the trades this import created (they carry importId), otherwise they linger and a
      // re-import flags every operation as a duplicate.
      const importTrades = trades.filter((t) => t.importId === record.id)
      await Promise.all(importTrades.map((t) => deleteTradeService(uid, t.id)))
      await deleteImportRecord(uid, record.id)
      toast.success('Importação revertida')
    } catch {
      toast.error('Erro ao reverter importação')
    }
  }

  // Removes trades left behind by imports that were reverted before revert started cleaning up
  // trades. An orphan is an import-sourced trade whose ImportRecord no longer exists.
  const cleanupOrphanTrades = async () => {
    if (!uid) return
    const recordIds = new Set(importRecords.map((r) => r.id))
    const orphans = trades.filter((t) => t.importId && !recordIds.has(t.importId))
    if (orphans.length === 0) return
    try {
      await Promise.all(orphans.map((t) => deleteTradeService(uid, t.id)))
      toast.success(`${orphans.length} operação(ões) órfã(s) removida(s)`)
    } catch {
      toast.error('Erro ao limpar operações órfãs')
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

  const orphanTradeCount = trades.filter(
    (t) => t.importId && !importRecords.some((r) => r.id === t.importId),
  ).length

  return {
    loading,
    uid,
    assets,
    categories,
    diagrams,
    answers,
    importRecords,
    trades,
    addAsset: assetsHook.addAsset,
    recordTrade,
    addManualTrade,
    deleteTrade: (tradeId: string) => (uid ? deleteTradeService(uid, tradeId) : Promise.resolve()),
    importFromB3,
    revertImport,
    cleanupOrphanTrades,
    orphanTradeCount,
    editAsset: assetsHook.editAsset,
    deleteAsset: assetsHook.deleteAsset,
    saveCategory,
    deleteCategory,
    saveDiagram,
    deleteDiagram,
    saveAnswers,
    refreshPrices: assetsHook.refreshPrices,
    refreshPricesIfStale: assetsHook.refreshPricesIfStale,
    refreshingPrices: assetsHook.refreshingPrices,
    priceError: assetsHook.priceError,
    fundamentals: fundamentalsHook.fundamentals,
    fiiManual: fundamentalsHook.fiiManual,
    fiiInfo: fundamentalsHook.fiiInfo,
    saveFiiInfo: fundamentalsHook.saveFiiInfo,
    stockInfo: fundamentalsHook.stockInfo,
    saveStockInfo: fundamentalsHook.saveStockInfo,
    exteriorInfo: fundamentalsHook.exteriorInfo,
    saveExteriorInfo: fundamentalsHook.saveExteriorInfo,
    refreshingFundamentals: fundamentalsHook.refreshingFundamentals,
    fundamentalErrors: fundamentalsHook.fundamentalErrors,
    refreshFundamentals,
    saveManualSnapshot,
    deleteSnapshot: fundamentalsHook.deleteSnapshot,
    saveFiiManual: fundamentalsHook.saveFiiManual,
    syncMissingTrades,
  }
}
