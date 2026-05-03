import { useEffect, useState } from 'react'
import {
  addAsset as addAssetService,
  deleteAsset as deleteAssetService,
  subscribeToAssets,
  updateAsset as updateAssetService,
  updateAssetPrice as updateAssetPriceService,
} from '@/services/assets'
import { calcFixedIncomeValue } from '@/services/bcb-rates'
import { clearQuoteCache, fetchLivePrices } from '@/services/quotes'
import { clearTesouroBondsCache } from '@/services/tesouro'
import type { Asset } from '@/types'

const deleteExpiredAssets = async (uid: string, assets: Asset[]) => {
  await Promise.all(assets.map((a) => deleteAssetService(uid, a.id)))
}

export const useAssets = (uid: string | null) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loaded, setLoaded] = useState(false)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    return subscribeToAssets(uid, (data) => {
      const today = new Date().toISOString().slice(0, 10)
      const expired = data.filter(
        (a) => a.type === 'fixed_income' && a.maturityDate && a.maturityDate < today,
      )
      if (expired.length > 0) void deleteExpiredAssets(uid, expired)
      setAssets(data.filter((a) => !expired.some((e) => e.id === a.id)))
      setLoaded(true)
    })
  }, [uid])

  const addAsset = (asset: Asset) => (uid ? addAssetService(uid, asset) : Promise.resolve())

  const editAsset = (assetId: string, data: Partial<Asset>) =>
    uid ? updateAssetService(uid, assetId, data) : Promise.resolve()

  const deleteAsset = (assetId: string) =>
    uid ? deleteAssetService(uid, assetId) : Promise.resolve()

  const refreshPrices = async () => {
    if (!uid || assets.length === 0) return
    setRefreshingPrices(true)
    setPriceError(null)
    clearQuoteCache()
    clearTesouroBondsCache()
    try {
      // Stocks, FIIs, ETFs, BDRs, crypto + Tesouro Direto
      const priceable = assets.filter(
        (a) =>
          (a.type !== 'fixed_income' && a.type !== 'other') ||
          a.ticker.toUpperCase().startsWith('TESOURO'),
      )
      const prices = await fetchLivePrices(
        priceable.map((a) => ({ ticker: a.ticker, type: a.type })),
      )
      await Promise.all(
        priceable
          .filter((a) => prices[a.ticker.toUpperCase()] !== undefined)
          .map((a) => updateAssetPriceService(uid, a.id, prices[a.ticker.toUpperCase()])),
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
              await updateAssetPriceService(uid, a.id, newValue)
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
    assets,
    loaded,
    refreshingPrices,
    priceError,
    addAsset,
    editAsset,
    deleteAsset,
    refreshPrices,
  }
}
