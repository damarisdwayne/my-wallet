import { useMemo } from 'react'
import { Minus } from 'lucide-react'
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
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

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
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
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

  const rows = useMemo(
    () => calcRebalance(assets, categories, diagrams, answers, totalValue),
    [assets, categories, diagrams, answers, totalValue],
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
