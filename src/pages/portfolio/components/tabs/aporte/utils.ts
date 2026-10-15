import type { Asset, PortfolioCategory } from '@/types'
import type { AssetAllocation, CategoryAllocation } from './constants'

export const calcDistribution = (
  aporte: number,
  categories: PortfolioCategory[],
  assets: Asset[],
  totalValue: number,
  assetTargets: Map<string, number>,
  excludedCatIds: Set<string> = new Set(),
  catOverrides: Map<string, number> = new Map(),
): CategoryAllocation[] => {
  const activeCats = categories.filter((c) => !excludedCatIds.has(c.id))
  const newTotal = totalValue + aporte

  const catData = activeCats.map((cat) => {
    const catAssets = assets.filter((a) => a.categoryId === cat.id)
    const catCurrentValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
    const catTargetValue = (cat.targetPercent / 100) * newTotal
    const catDeficit = Math.max(0, catTargetValue - catCurrentValue)
    return { cat, catAssets, catCurrentValue, catTargetValue, catDeficit }
  })

  const catAportes = splitCategoryAportes(aporte, catData, catOverrides)

  return catData.map(({ cat, catAssets, catCurrentValue, catTargetValue }) => {
    const catAporte = catAportes.get(cat.id) ?? 0

    const newCatTotal = catCurrentValue + catAporte

    const assetData = catAssets
      .filter((asset) => !asset.pauseAporte)
      .filter((asset) => !(asset.ceilingPrice && asset.currentPrice >= asset.ceilingPrice))
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
      catOverridden: catOverrides.has(cat.id),
      catRecommendedValue: catTargetValue,
      catValueAfterAporte: catCurrentValue + catAporte,
      catPercentBefore: totalValue > 0 ? (catCurrentValue / totalValue) * 100 : 0,
      catPercentAfter: newTotal > 0 ? ((catCurrentValue + catAporte) / newTotal) * 100 : 0,
      assetAllocations,
    }
  })
}

interface CategoryDeficit {
  cat: PortfolioCategory
  catDeficit: number
}

const splitCategoryAportes = (
  aporte: number,
  catData: CategoryDeficit[],
  catOverrides: Map<string, number>,
): Map<string, number> => {
  const result = new Map<string, number>()
  const fixedTotal = catData.reduce((s, { cat }) => s + (catOverrides.get(cat.id) ?? 0), 0)
  catData.forEach(({ cat }) => {
    if (catOverrides.has(cat.id)) result.set(cat.id, catOverrides.get(cat.id) ?? 0)
  })

  let remaining = Math.max(0, aporte - fixedTotal)
  let open = catData.filter(({ cat, catDeficit }) => !catOverrides.has(cat.id) && catDeficit > 0)

  while (remaining > 0.01 && open.length > 0) {
    const totalDeficit = open.reduce((s, c) => s + c.catDeficit, 0)
    let distributed = 0
    open.forEach(({ cat, catDeficit }) => {
      const current = result.get(cat.id) ?? 0
      const add = Math.min((catDeficit / totalDeficit) * remaining, catDeficit - current)
      result.set(cat.id, current + add)
      distributed += add
    })
    remaining -= distributed
    open = open.filter(({ cat, catDeficit }) => catDeficit - (result.get(cat.id) ?? 0) > 0.01)
  }

  catData.forEach(({ cat }) => {
    if (!result.has(cat.id)) result.set(cat.id, 0)
  })

  return result
}
