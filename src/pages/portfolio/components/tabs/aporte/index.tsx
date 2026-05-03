import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import { computeAssetTargets } from '../../../compute-targets'
import type { CategoryAllocation, Props } from './constants'
import { calcDistribution } from './utils'
import { CategoryRow } from './components'

export const AporteTab = ({
  assets,
  categories,
  diagrams,
  answers,
  totalValue,
  refreshPrices,
  refreshingPrices,
}: Props) => {
  const [aporteInput, setAporteInput] = useState('')
  const [distribution, setDistribution] = useState<CategoryAllocation[] | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { hideValues } = usePrivacy()

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const calcular = async () => {
    const aporte = Number.parseFloat(aporteInput) || 0
    if (aporte <= 0) return
    await refreshPrices()
    const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)
    setDistribution(calcDistribution(aporte, categories, assets, totalValue, assetTargets))
  }

  const aporte = distribution ? Number.parseFloat(aporteInput) || 0 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <label htmlFor="aporte-input" className="text-xs text-muted-foreground mb-1 block">
            Valor do aporte (R$)
          </label>
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
          disabled={!aporteInput || Number.parseFloat(aporteInput) <= 0 || refreshingPrices}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 sm:mb-0"
        >
          {refreshingPrices ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {distribution !== null && categories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma categoria configurada. Vá em Alocação para criar categorias.
        </p>
      )}

      {aporte > 0 && distribution && distribution.length > 0 && (
        <div className="space-y-2">
          {distribution.map((allocation) => {
            const isFixedIncome = allocation.cat.assetTypes.some(
              (t) => t === 'fixed_income' || t === 'tesouro',
            )
            const isOpen = !isFixedIncome && expanded.has(allocation.cat.id)
            return (
              <CategoryRow
                key={allocation.cat.id}
                allocation={allocation}
                isOpen={isOpen}
                onToggle={() => toggle(allocation.cat.id)}
              />
            )
          })}

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total distribuído</span>
            <span className="font-semibold text-foreground">
              {hideValues
                ? MASK
                : formatCurrency(distribution.reduce((s, c) => s + c.catAporte, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
