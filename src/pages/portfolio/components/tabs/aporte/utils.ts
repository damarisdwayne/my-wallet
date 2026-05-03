import type { Asset, PortfolioCategory } from '@/types'
import type { AssetAllocation, CategoryAllocation } from './constants'

export const calcDistribution = (
  aporte: number,
  categories: PortfolioCategory[],
  assets: Asset[],
  totalValue: number,
  assetTargets: Map<string, number>,
): CategoryAllocation[] => {
  const newTotal = totalValue + aporte
  const totalTargetPct = categories.reduce((s, c) => s + c.targetPercent, 0)

  const catData = categories.map((cat) => {
    const catAssets = assets.filter((a) => a.categoryId === cat.id)
    const catCurrentValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
    const catTargetValue = (cat.targetPercent / 100) * newTotal
    const catDeficit = Math.max(0, catTargetValue - catCurrentValue)
    return { cat, catAssets, catCurrentValue, catTargetValue, catDeficit }
  })

  const totalDeficit = catData.reduce((s, c) => s + c.catDeficit, 0)

  return catData.map(({ cat, catAssets, catCurrentValue, catTargetValue, catDeficit }) => {
    const rawCatAporte =
      totalDeficit > 0
        ? (catDeficit / totalDeficit) * aporte
        : totalTargetPct > 0
          ? (cat.targetPercent / totalTargetPct) * aporte
          : aporte / Math.max(categories.length, 1)

    const catAporte = Math.min(rawCatAporte, catDeficit)

    const newCatTotal = catCurrentValue + catAporte

    const assetData = catAssets
      .map((asset) => {
        const withinCatRatio =
          cat.targetPercent > 0 ? (assetTargets.get(asset.id) ?? 0) / cat.targetPercent : 0
        const assetCurrentValue = asset.currentPrice * asset.quantity
        const assetRecommended = withinCatRatio * newCatTotal
        const assetDeficit = Math.max(0, assetRecommended - assetCurrentValue)
        return { asset, assetCurrentValue, assetRecommended, assetDeficit, withinCatRatio }
      })
      .filter((d) => d.withinCatRatio > 0)

    const totalAssetDeficit = assetData.reduce((s, a) => s + a.assetDeficit, 0)

    const assetAllocations: AssetAllocation[] = assetData
      .map(({ asset, assetCurrentValue, assetRecommended, assetDeficit }) => {
        const rawAssetAporte =
          totalAssetDeficit > 0
            ? (assetDeficit / totalAssetDeficit) * catAporte
            : catAporte / Math.max(assetData.length, 1)

        const assetAporte = Math.min(rawAssetAporte, assetDeficit)

        return {
          asset,
          aporte: assetAporte,
          quantityToBuy: asset.currentPrice > 0 ? assetAporte / asset.currentPrice : 0,
          recommendedValue: assetRecommended,
          valueAfterAporte: assetCurrentValue + assetAporte,
        }
      })
      .filter((a) => a.aporte > 0.01)

    return {
      cat,
      catCurrentValue,
      catAporte,
      catRecommendedValue: catTargetValue,
      catValueAfterAporte: catCurrentValue + catAporte,
      catPercentBefore: totalValue > 0 ? (catCurrentValue / totalValue) * 100 : 0,
      catPercentAfter: newTotal > 0 ? ((catCurrentValue + catAporte) / newTotal) * 100 : 0,
      assetAllocations,
    }
  })
}
