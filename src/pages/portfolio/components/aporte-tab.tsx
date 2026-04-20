import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Asset, PortfolioCategory } from '@/types'

interface AssetAllocation {
  asset: Asset
  aporte: number
  quantityToBuy: number
}

interface CategoryAllocation {
  cat: PortfolioCategory
  catCurrentValue: number
  catAporte: number
  catPercentBefore: number
  catPercentAfter: number
  assetAllocations: AssetAllocation[]
}

function calcDistribution(
  aporte: number,
  categories: PortfolioCategory[],
  assets: Asset[],
  totalValue: number,
): CategoryAllocation[] {
  const newTotal = totalValue + aporte
  const totalTargetPct = categories.reduce((s, c) => s + c.targetPercent, 0)

  const catData = categories.map((cat) => {
    const catAssets = assets.filter((a) => a.categoryId === cat.id)
    const catCurrentValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
    const catTargetValue = (cat.targetPercent / 100) * newTotal
    const catDeficit = Math.max(0, catTargetValue - catCurrentValue)
    return { cat, catAssets, catCurrentValue, catDeficit }
  })

  const totalDeficit = catData.reduce((s, c) => s + c.catDeficit, 0)

  return catData.map(({ cat, catAssets, catCurrentValue, catDeficit }) => {
    const catAporte =
      totalDeficit > 0
        ? (catDeficit / totalDeficit) * aporte
        : totalTargetPct > 0
          ? (cat.targetPercent / totalTargetPct) * aporte
          : aporte / Math.max(categories.length, 1)

    const newCatTotal = catCurrentValue + catAporte
    const totalAssetTargetPct = catAssets.reduce((s, a) => s + a.targetPercent, 0)

    const assetData = catAssets.map((asset) => {
      const assetCurrentValue = asset.currentPrice * asset.quantity
      const assetTargetValue = (asset.targetPercent / 100) * newCatTotal
      const assetDeficit = Math.max(0, assetTargetValue - assetCurrentValue)
      return { asset, assetCurrentValue, assetDeficit }
    })

    const totalAssetDeficit = assetData.reduce((s, a) => s + a.assetDeficit, 0)

    const assetAllocations: AssetAllocation[] = assetData.map(({ asset, assetDeficit }) => {
      const assetAporte =
        totalAssetDeficit > 0
          ? (assetDeficit / totalAssetDeficit) * catAporte
          : totalAssetTargetPct > 0
            ? (asset.targetPercent / totalAssetTargetPct) * catAporte
            : catAporte / Math.max(catAssets.length, 1)

      return {
        asset,
        aporte: assetAporte,
        quantityToBuy: asset.currentPrice > 0 ? assetAporte / asset.currentPrice : 0,
      }
    })

    return {
      cat,
      catCurrentValue,
      catAporte,
      catPercentBefore: totalValue > 0 ? (catCurrentValue / totalValue) * 100 : 0,
      catPercentAfter: newTotal > 0 ? ((catCurrentValue + catAporte) / newTotal) * 100 : 0,
      assetAllocations,
    }
  })
}

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
}

export const AporteTab = ({ assets, categories, totalValue }: Props) => {
  const [aporteInput, setAporteInput] = useState('')
  const [distribution, setDistribution] = useState<CategoryAllocation[] | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const calcular = () => {
    const aporte = Number.parseFloat(aporteInput) || 0
    if (aporte <= 0) return
    setDistribution(calcDistribution(aporte, categories, assets, totalValue))
  }

  const aporte = distribution ? Number.parseFloat(aporteInput) || 0 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Valor do aporte (R$)</label>
          <input
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

      {aporte > 0 && distribution.length > 0 && (
        <div className="space-y-2">
          {distribution.map(
            ({
              cat,
              catCurrentValue,
              catAporte,
              catPercentBefore,
              catPercentAfter,
              assetAllocations,
            }) => {
              const isOpen = !collapsed.has(cat.id)
              return (
                <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggle(cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span className="font-medium text-sm text-foreground flex-1">{cat.name}</span>
                    <div className="flex items-center gap-5 text-xs shrink-0">
                      <span className="text-muted-foreground hidden sm:inline">
                        {catPercentBefore.toFixed(1)}%{' '}
                        <span className="text-foreground font-medium">
                          → {catPercentAfter.toFixed(1)}%
                        </span>
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {formatCurrency(catAporte)}
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          'text-muted-foreground transition-transform',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </div>
                  </button>

                  {isOpen && assetAllocations.length > 0 && (
                    <div className="divide-y divide-border">
                      {assetAllocations.map(({ asset, aporte: assetAporte, quantityToBuy }) => (
                        <div
                          key={asset.id}
                          className="flex items-center gap-3 px-4 py-2.5 pl-10 text-sm"
                        >
                          <div className="flex-1">
                            <span className="font-semibold text-foreground">{asset.ticker}</span>
                            <span className="text-muted-foreground ml-2 text-xs truncate">
                              {asset.name}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
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
                      ))}

                      {assetAllocations.length === 0 && (
                        <p className="px-10 py-2.5 text-xs text-muted-foreground">
                          Nenhum ativo nesta categoria.
                        </p>
                      )}
                    </div>
                  )}

                  {isOpen && assetAllocations.length === 0 && (
                    <p className="px-10 py-2.5 text-xs text-muted-foreground border-t border-border">
                      Nenhum ativo nesta categoria.
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
