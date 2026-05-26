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
import { addTrade } from '@/services/trades'
import { clearTesouroBondsCache } from '@/services/tesouro'
import { freshPricesAtom } from '@/store/prices'
import type { Asset } from '@/types'
import { toast } from 'sonner'

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

  const refreshPrices = async () => {
    if (!uid || assets.length === 0) return
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
      toast.success('Preços atualizados')
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
    await refreshPrices()
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
