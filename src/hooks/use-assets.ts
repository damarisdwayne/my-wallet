import { useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import {
  addAsset as addAssetService,
  deleteAsset as deleteAssetService,
  subscribeToAssets,
  updateAsset as updateAssetService,
  updateAssetPrice as updateAssetPriceService,
} from '@/services/assets'
import { calcFixedIncomeValue } from '@/services/bcb-rates'
import { clearQuoteCache, fetchLivePrices } from '@/services/quotes'
import type { PriceMap } from '@/services/quotes'
import { addTrade } from '@/services/trades'
import { clearTesouroBondsCache } from '@/services/tesouro'
import { freshPricesAtom, priceChangesAtom, priceChangesOpenAtom } from '@/store/prices'
import type { PriceChange } from '@/store/prices'
import type { Asset } from '@/types'
import { toast } from 'sonner'

// Movements smaller than this are noise — they would bury the meaningful ones.
const MIN_CHANGE_PCT = 0.5

// Comparing against the last saved price is useless: the page auto-refreshes on
// mount, so a manual refresh moments later would diff against itself and show
// nothing. Instead we pin a baseline snapshot and only renew it once it is stale,
// so every refresh in between reports the movement since that fixed point.
const BASELINE_KEY = 'mw_price_baseline_v1'
const BASELINE_MAX_AGE_MS = 12 * 60 * 60 * 1000

interface PriceBaseline {
  at: number
  prices: Record<string, number>
}

const getBaseline = (): PriceBaseline | null => {
  try {
    const raw = localStorage.getItem(BASELINE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PriceBaseline
    return parsed.at && parsed.prices ? parsed : null
  } catch {
    return null
  }
}

const saveBaseline = (prices: PriceMap) => {
  const flat = Object.fromEntries(Object.entries(prices).map(([t, p]) => [t, p.brl]))
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify({ at: Date.now(), prices: flat }))
  } catch {
    // storage unavailable (private mode) — the summary just falls back to saved prices
  }
}

const buildPriceChanges = (
  assets: Asset[],
  prices: PriceMap,
  baseline: PriceBaseline | null,
): PriceChange[] =>
  assets
    .flatMap((a) => {
      const p = prices[a.ticker.toUpperCase()]
      const reference = baseline?.prices[a.ticker.toUpperCase()] ?? a.currentPrice
      if (p === undefined || !reference) return []
      const pct = ((p.brl - reference) / reference) * 100
      if (Math.abs(pct) < MIN_CHANGE_PCT) return []
      return [
        {
          ticker: a.ticker,
          type: a.type,
          quantity: a.quantity,
          oldPrice: reference,
          newPrice: p.brl,
          pct,
          impactBrl: (p.brl - reference) * a.quantity,
        },
      ]
    })
    .sort((a, b) => Math.abs(b.impactBrl) - Math.abs(a.impactBrl))

const deleteExpiredAssets = async (uid: string, assets: Asset[]) => {
  await Promise.all(
    assets.map(async (a) => {
      const total = a.quantity * a.currentPrice
      await addTrade(uid, {
        ticker: a.ticker,
        type: 'sell',
        quantity: a.quantity,
        price: a.currentPrice,
        total,
        date: a.maturityDate ?? '',
        source: 'manual',
        label: 'vencimento',
      })
      await deleteAssetService(uid, a.id)
    }),
  )
}

export const useAssets = (uid: string | null) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loaded, setLoaded] = useState(false)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const setFreshPrices = useSetAtom(freshPricesAtom)
  const setPriceChanges = useSetAtom(priceChangesAtom)
  const setPriceChangesOpen = useSetAtom(priceChangesOpenAtom)
  const PRICE_TS_KEY = 'mw_price_refreshed_at'
  const getPriceTs = () => {
    try {
      const v = localStorage.getItem(PRICE_TS_KEY)
      return v ? Number(v) : null
    } catch {
      return null
    }
  }
  const setPriceTs = () => {
    try {
      localStorage.setItem(PRICE_TS_KEY, String(Date.now()))
    } catch {}
  }

  useEffect(() => {
    if (!uid) return
    return subscribeToAssets(uid, (data) => {
      const today = new Date().toISOString().slice(0, 10)
      const expired = data.filter(
        (a) =>
          (a.type === 'fixed_income' || a.type === 'tesouro') &&
          a.maturityDate &&
          a.maturityDate < today,
      )
      if (expired.length > 0) void deleteExpiredAssets(uid, expired)
      setAssets(data.filter((a) => !expired.some((e) => e.id === a.id)))
      setLoaded(true)
    })
  }, [uid])

  const addAsset = async (asset: Asset) => {
    if (!uid) return
    try {
      await addAssetService(uid, asset)
    } catch {
      toast.error('Erro ao adicionar ativo')
    }
  }

  const editAsset = async (assetId: string, data: Partial<Asset>) => {
    if (!uid) return
    try {
      await updateAssetService(uid, assetId, data)
    } catch {
      toast.error('Erro ao editar ativo')
    }
  }

  const deleteAsset = async (assetId: string) => {
    if (!uid) return
    try {
      await deleteAssetService(uid, assetId)
    } catch {
      toast.error('Erro ao excluir ativo')
    }
  }

  const refreshPrices = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!uid || assets.length === 0) return
    const baseline = getBaseline()
    setRefreshingPrices(true)
    setPriceError(null)
    clearQuoteCache()
    clearTesouroBondsCache()
    try {
      // Stocks, FIIs, ETFs, BDRs, crypto, Tesouro Direto, US assets
      const priceable = assets.filter((a) => a.type !== 'fixed_income' && a.type !== 'other')
      const prices = await fetchLivePrices(
        priceable.map((a) => ({ ticker: a.ticker, type: a.type })),
      )
      await Promise.all(
        priceable
          .filter((a) => prices[a.ticker.toUpperCase()] !== undefined)
          .map((a) => {
            const p = prices[a.ticker.toUpperCase()]
            return updateAssetService(uid, a.id, {
              currentPrice: p.brl,
              currentPriceUsd: p.usd,
            })
          }),
      )
      setFreshPrices(prices)

      const changes = buildPriceChanges(priceable, prices, baseline)
      setPriceChanges({
        changes,
        previousRefreshAt: baseline?.at ?? getPriceTs(),
        refreshedAt: Date.now(),
      })
      if (!silent && changes.length > 0) setPriceChangesOpen(true)
      if (!baseline || Date.now() - baseline.at > BASELINE_MAX_AGE_MS) saveBaseline(prices)

      // Flat fixed income (CDB, LCI, LCA…) — calculate via BCB rates API
      const flatFI = assets.filter((a) => a.type === 'fixed_income')
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
              await updateAssetPriceService(uid, a.id, newValue)
            }
          }),
      )
      setPriceTs()
      if (silent && changes.length > 0) {
        toast.success('Preços atualizados', {
          description: `${changes.length} ${changes.length === 1 ? 'ativo se moveu' : 'ativos se moveram'} desde a última atualização`,
          duration: 10000,
          action: { label: 'Ver', onClick: () => setPriceChangesOpen(true) },
        })
      } else if (!silent && changes.length === 0) {
        toast.success('Preços atualizados', {
          description: 'Nenhuma variação relevante desde a última referência',
        })
      } else {
        toast.success('Preços atualizados')
      }
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : 'Erro ao atualizar preços')
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar preços')
    } finally {
      setRefreshingPrices(false)
    }
  }

  const refreshPricesIfStale = async (maxAgeMs = 2 * 60 * 60 * 1000) => {
    const last = getPriceTs()
    if (last && Date.now() - last < maxAgeMs) return
    await refreshPrices({ silent: true })
  }

  return {
    assets,
    loaded,
    refreshingPrices,
    priceError,
    addAsset,
    editAsset,
    deleteAsset,
    refreshPrices,
    refreshPricesIfStale,
  }
}
