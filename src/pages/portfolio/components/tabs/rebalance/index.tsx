import { useMemo, useState } from 'react'
import { Minus, Play, RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import { computeAssetTargets } from '../../../compute-targets'
import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  totalValue: number
}

interface CatRebalance {
  cat: PortfolioCategory
  currentValue: number
  targetValue: number
  diff: number
  currentPct: number
  targetPct: number
  assets: AssetRebalance[]
}

interface AssetRebalance {
  asset: Asset
  currentValue: number
  targetValue: number
  diff: number
  currentPct: number
  targetPct: number
}

const calcRebalance = (
  assets: Asset[],
  categories: PortfolioCategory[],
  diagrams: Diagram[],
  answers: Record<string, AssetAnswers>,
  totalValue: number,
): CatRebalance[] => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  return categories
    .filter((c) => c.targetPercent > 0)
    .map((cat) => {
      const catAssets = assets.filter((a) => a.categoryId === cat.id)
      const currentValue = catAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
      const targetValue = (cat.targetPercent / 100) * totalValue
      const diff = currentValue - targetValue

      const assetRows: AssetRebalance[] = catAssets
        .map((a) => {
          const withinCatRatio =
            cat.targetPercent > 0 ? (assetTargets.get(a.id) ?? 0) / cat.targetPercent : 0
          const assetCurrentValue = a.currentPrice * a.quantity
          const assetTargetValue = withinCatRatio * targetValue
          return {
            asset: a,
            currentValue: assetCurrentValue,
            targetValue: assetTargetValue,
            diff: assetCurrentValue - assetTargetValue,
            currentPct: totalValue > 0 ? (assetCurrentValue / totalValue) * 100 : 0,
            targetPct: withinCatRatio * cat.targetPercent,
          }
        })
        .filter((r) => r.targetPct > 0)
        .sort((a, b) => {
          const aBuy = a.diff < -1
          const bBuy = b.diff < -1
          const aSell = a.diff > 1
          const bSell = b.diff > 1
          const priority = (buy: boolean, sell: boolean) => (buy ? 0 : sell ? 1 : 2)
          const diffPriority = priority(aBuy, aSell) - priority(bBuy, bSell)
          if (diffPriority !== 0) return diffPriority
          return Math.abs(b.diff) - Math.abs(a.diff)
        })

      return {
        cat,
        currentValue,
        targetValue,
        diff,
        currentPct: totalValue > 0 ? (currentValue / totalValue) * 100 : 0,
        targetPct: cat.targetPercent,
        assets: assetRows,
      }
    })
    .sort((a, b) => {
      const aBuy = a.diff < -1
      const bBuy = b.diff < -1
      const aSell = a.diff > 1
      const bSell = b.diff > 1
      const priority = (buy: boolean, sell: boolean) => (buy ? 0 : sell ? 1 : 2)
      const diffPriority = priority(aBuy, aSell) - priority(bBuy, bSell)
      if (diffPriority !== 0) return diffPriority
      return Math.abs(b.diff) - Math.abs(a.diff)
    })
}

const DiffBadge = ({ diff }: { diff: number }) => {
  const abs = Math.abs(diff)
  if (abs < 1)
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
        <Minus size={11} /> Ajustado
      </span>
    )
  if (diff > 0)
    return <span className="text-xs text-destructive">Vender {formatCurrency(abs)}</span>
  return <span className="text-xs text-success">Comprar {formatCurrency(abs)}</span>
}

export const RebalanceTab = ({ assets, categories, diagrams, answers, totalValue }: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  const [simulatedInput, setSimulatedInput] = useState('')
  const [appliedTotal, setAppliedTotal] = useState<number | null>(null)
  const parsedInput = Number.parseFloat(simulatedInput.replaceAll('.', '').replace(',', '.'))
  const canSimulate = !Number.isNaN(parsedInput) && parsedInput > 0
  const isSimulating = appliedTotal !== null
  const effectiveTotal = appliedTotal ?? totalValue

  const handleSimulatedChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      setSimulatedInput('')
      return
    }
    setSimulatedInput(Number.parseInt(digits, 10).toLocaleString('pt-BR'))
  }

  const applySimulation = () => {
    if (canSimulate) setAppliedTotal(parsedInput)
  }

  const resetSimulation = () => {
    setAppliedTotal(null)
    setSimulatedInput('')
  }

  const rows = useMemo(
    () => calcRebalance(assets, categories, diagrams, answers, effectiveTotal),
    [assets, categories, diagrams, answers, effectiveTotal],
  )

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Configure categorias e metas em Alocação para usar o rebalanceamento.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Quanto vender/comprar de cada categoria para atingir as metas de alocação — sem aportar
        dinheiro novo.
      </p>

      {/* Summary + simulator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total investido</p>
          <p className="text-lg font-bold text-foreground">{fmt(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Simular com valor (R$)</p>
            <div className="flex items-center gap-1">
              <button
                onClick={applySimulation}
                disabled={!canSimulate}
                title="Simular"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
              >
                <Play size={11} />
                Simular
              </button>
              {isSimulating && (
                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
                  title="Voltar ao valor real"
                >
                  <RotateCcw size={11} />
                  Resetar
                </button>
              )}
            </div>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="ex: 300.000"
            value={simulatedInput}
            onChange={(e) => handleSimulatedChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySimulation()}
            className="w-full bg-transparent text-lg font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>
      </div>

      {isSimulating && (
        <p className="text-xs text-primary">
          Simulando com {fmt(effectiveTotal)} — os valores "Alvo" mostram quanto cada
          categoria/ativo deveria ter neste cenário.
        </p>
      )}

      {/* Category table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Categoria</th>
              <th className="px-4 py-2.5 font-medium text-right">Atual</th>
              <th className="px-4 py-2.5 font-medium text-right">Alvo</th>
              <th className="px-4 py-2.5 font-medium text-right">% Atual</th>
              <th className="px-4 py-2.5 font-medium text-right">% Alvo</th>
              <th className="px-4 py-2.5 font-medium text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <>
                {/* Category row */}
                <tr key={row.cat.id} className="border-b border-border bg-card">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: row.cat.color }}
                      />
                      <span className="font-semibold text-foreground">{row.cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">{fmt(row.currentValue)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {fmt(row.targetValue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${Math.abs(row.currentPct - row.targetPct) > 2 ? (row.currentPct > row.targetPct ? 'text-destructive' : 'text-success') : 'text-foreground'}`}
                    >
                      {row.currentPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {row.targetPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DiffBadge diff={row.diff} />
                  </td>
                </tr>

                {/* Asset sub-rows */}
                {row.assets.map((ar) => (
                  <tr
                    key={ar.asset.id}
                    className="border-b border-border/50 bg-muted/10 last:border-b"
                  >
                    <td className="pl-10 pr-4 py-2 text-xs text-muted-foreground">
                      {ar.asset.ticker}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-foreground">
                      {fmt(ar.currentValue)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                      {fmt(ar.targetValue)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs">
                      <span
                        className={
                          Math.abs(ar.currentPct - ar.targetPct) > 1
                            ? ar.currentPct > ar.targetPct
                              ? 'text-destructive'
                              : 'text-success'
                            : 'text-muted-foreground'
                        }
                      >
                        {ar.currentPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                      {ar.targetPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right">
                      {Math.abs(ar.diff) >= 1 && (
                        <span
                          className={`text-xs ${ar.diff > 0 ? 'text-destructive' : 'text-success'}`}
                        >
                          {ar.diff > 0 ? 'Vender' : 'Comprar'} {fmt(Math.abs(ar.diff))}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Os valores consideram o preço atual dos ativos. Vendas de ações acima de R$20k/mês podem
        gerar DARF. FIIs sempre geram imposto na venda com lucro.
      </p>
    </div>
  )
}
