import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'
import { computeAssetTargets } from '../compute-targets'

interface AssetAllocation {
  asset: Asset
  aporte: number
  quantityToBuy: number
  recommendedValue: number
  valueAfterAporte: number
}

interface CategoryAllocation {
  cat: PortfolioCategory
  catCurrentValue: number
  catAporte: number
  catRecommendedValue: number
  catValueAfterAporte: number
  catPercentBefore: number
  catPercentAfter: number
  assetAllocations: AssetAllocation[]
}

const calcDistribution = (
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

    // Cap category aporte at its deficit so we never exceed target
    const catAporte = Math.min(rawCatAporte, catDeficit)

    const newCatTotal = catCurrentValue + catAporte

    // Per-asset: use assetTargets (respects diagram scores — score-0 assets have 0 target)
    const assetData = catAssets
      .map((asset) => {
        const withinCatRatio =
          cat.targetPercent > 0 ? (assetTargets.get(asset.id) ?? 0) / cat.targetPercent : 0
        const assetCurrentValue = asset.currentPrice * asset.quantity
        const assetRecommended = withinCatRatio * newCatTotal
        const assetDeficit = Math.max(0, assetRecommended - assetCurrentValue)
        return { asset, assetCurrentValue, assetRecommended, assetDeficit, withinCatRatio }
      })
      .filter((d) => d.withinCatRatio > 0) // skip score-0 / unallocated assets

    const totalAssetDeficit = assetData.reduce((s, a) => s + a.assetDeficit, 0)

    const assetAllocations: AssetAllocation[] = assetData
      .map(({ asset, assetCurrentValue, assetRecommended, assetDeficit }) => {
        const rawAssetAporte =
          totalAssetDeficit > 0
            ? (assetDeficit / totalAssetDeficit) * catAporte
            : catAporte / Math.max(assetData.length, 1)

        // Cap at deficit so asset never exceeds its target
        const assetAporte = Math.min(rawAssetAporte, assetDeficit)

        return {
          asset,
          aporte: assetAporte,
          quantityToBuy: asset.currentPrice > 0 ? assetAporte / asset.currentPrice : 0,
          recommendedValue: assetRecommended,
          valueAfterAporte: assetCurrentValue + assetAporte,
        }
      })
      .filter((a) => a.aporte > 0.01) // hide assets with negligible aporte

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

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  totalValue: number
}

export const AporteTab = ({ assets, categories, diagrams, answers, totalValue }: Props) => {
  const [aporteInput, setAporteInput] = useState('')
  const [distribution, setDistribution] = useState<CategoryAllocation[] | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const calcular = () => {
    const aporte = Number.parseFloat(aporteInput) || 0
    if (aporte <= 0) return
    const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)
    setDistribution(calcDistribution(aporte, categories, assets, totalValue, assetTargets))
  }

  const aporte = distribution ? Number.parseFloat(aporteInput) || 0 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <label htmlFor="aporte-input" className="text-xs text-muted-foreground mb-1 block">Valor do aporte (R$)</label>
          <input
            id="aporte-input"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-52"
            type="number"
            min={0}
            step={100}
            placeholder="2000"
            value={aporteInput}
            onChange={(e) => {
              setAporteInput(e.target.value)
              setDistribution(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && calcular()}
            autoFocus
          />
        </div>
        <button
          onClick={calcular}
          disabled={!aporteInput || Number.parseFloat(aporteInput) <= 0}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 sm:mb-0"
        >
          Calcular
        </button>
      </div>

      {distribution !== null && categories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma categoria configurada. Vá em Alocação para criar categorias.
        </p>
      )}

      {aporte > 0 && distribution && distribution.length > 0 && (
        <div className="space-y-2">
          {distribution.map(
            ({
              cat,
              catAporte,
              catRecommendedValue,
              catValueAfterAporte,
              catPercentBefore,
              catPercentAfter,
              assetAllocations,
            }) => {
              const isFixedIncome = cat.type === 'fixed_income'
              const isOpen = !isFixedIncome && expanded.has(cat.id)
              return (
                <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => !isFixedIncome && toggle(cat.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 bg-muted/30 text-left transition-colors',
                      !isFixedIncome && 'hover:bg-muted/50 cursor-pointer',
                      isFixedIncome && 'cursor-default',
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
                        rec. {formatCurrency(catRecommendedValue)}
                        <span className="mx-1">→</span>
                        <span className="text-foreground">após {formatCurrency(catValueAfterAporte)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <span className="text-muted-foreground hidden sm:inline">
                        {catPercentBefore.toFixed(1)}%
                        <span className="mx-1">→</span>
                        <span className="text-foreground font-medium">{catPercentAfter.toFixed(1)}%</span>
                      </span>
                      <span className="font-semibold text-foreground text-sm min-w-20 text-right">
                        {formatCurrency(catAporte)}
                      </span>
                      {!isFixedIncome && (
                        <ChevronDown
                          size={14}
                          className={cn(
                            'text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      )}
                    </div>
                  </button>

                  {isOpen && assetAllocations.length > 0 && (
                    <div className="divide-y divide-border">
                      {assetAllocations.map(
                        ({ asset, aporte: assetAporte, quantityToBuy, recommendedValue, valueAfterAporte }) => (
                          <div
                            key={asset.id}
                            className="flex items-center gap-3 px-4 py-2.5 pl-10 text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{asset.ticker}</p>
                              <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
                                rec. {formatCurrency(recommendedValue)}
                                <span className="mx-1">→</span>
                                <span className="text-foreground">após {formatCurrency(valueAfterAporte)}</span>
                              </p>
                            </div>
                            <div className="text-right shrink-0 min-w-20">
                              <p className="font-medium text-foreground">
                                {formatCurrency(assetAporte)}
                              </p>
                              {asset.currentPrice > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  ~{Math.floor(quantityToBuy)} unid. (
                                  {formatCurrency(Math.floor(quantityToBuy) * asset.currentPrice)})
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {isOpen && assetAllocations.length === 0 && (
                    <p className="px-10 py-2.5 text-xs text-muted-foreground border-t border-border">
                      Nenhum ativo elegível nesta categoria (verifique as pontuações no diagrama).
                    </p>
                  )}
                </div>
              )
            },
          )}

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total distribuído</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(distribution.reduce((s, c) => s + c.catAporte, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
