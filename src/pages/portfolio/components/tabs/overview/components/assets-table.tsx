import { memo } from 'react'
import { ChevronDown, ChevronUp, Pencil, PauseCircle, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent, formatQuantity } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import { ALL, typeLabel } from '../../../../constants'
import type { TableRow, SortCol } from '../constants'
import type { Asset, PortfolioCategory } from '@/types'
import { isFlatFixedIncome } from '../utils'
import { getFiLabel } from '@/lib/fi'

interface AssetsTableProps {
  tableRows: TableRow[]
  filterCatId: string | typeof ALL
  sortCol: SortCol
  sortDir: 'asc' | 'desc'
  categories: PortfolioCategory[]
  totalValue: number
  filteredTotal: number
  assets: Asset[]
  assetTargets: Map<string, number>
  fixedIncomeCatId: string | null
  onToggleSort: (col: SortCol) => void
  onEditAsset: (asset: Asset) => void
  onSetFilterCatId: (id: string | typeof ALL) => void
  onNavigateToAnalysis: (ticker: string) => void
}

export const AssetsTable = memo(
  ({
    tableRows,
    filterCatId,
    sortCol,
    sortDir,
    categories,
    totalValue,
    filteredTotal,
    assets,
    assetTargets,
    fixedIncomeCatId,
    onToggleSort,
    onEditAsset,
    onSetFilterCatId,
    onNavigateToAnalysis,
  }: AssetsTableProps) => {
    const { hideValues } = usePrivacy()
    const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

    const renderGroupRow = (row: Extract<TableRow, { kind: 'group' }>) => {
      const ret = row.cost > 0 ? ((row.total - row.cost) / row.cost) * 100 : 0
      return (
        <tr
          key="fi-group"
          className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer"
          onClick={() => fixedIncomeCatId && onSetFilterCatId(fixedIncomeCatId)}
        >
          <td className="py-3 pl-3">
            <p className="font-semibold text-foreground">{row.label}</p>
            <p className="text-xs text-muted-foreground">{row.subtitle}</p>
          </td>
          <td className="py-3">
            <Badge variant="secondary">Renda Fixa</Badge>
          </td>
          <td className="py-3 text-right text-muted-foreground">—</td>
          <td className="py-3 text-right text-muted-foreground">—</td>
          <td className="py-3 text-right font-medium text-foreground">{fmt(row.cost)}</td>
          <td className="py-3 text-right text-muted-foreground">—</td>
          <td className="py-3 text-right font-medium text-foreground">{fmt(row.total)}</td>
          <td className="py-3 text-right">
            <p className="font-medium text-foreground">{fmt(row.recommended)}</p>
            <p className={`text-xs ${row.diff >= 0 ? 'text-success' : 'text-destructive'}`}>
              {row.diff >= 0 ? '+' : ''}
              {fmt(row.diff)}
            </p>
          </td>
          <td
            className={`py-3 text-right font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {formatPercent(ret)}
          </td>
          <td className="py-3 text-right text-muted-foreground">{row.pct.toFixed(1)}%</td>
          <td />
        </tr>
      )
    }

    const mobileCards = (
      <div className="flex flex-col gap-2 md:hidden">
        {tableRows.map((row) => {
          if (row.kind === 'group') {
            const ret = row.cost > 0 ? ((row.total - row.cost) / row.cost) * 100 : 0
            return (
              <div
                key="fi-group"
                className="rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => fixedIncomeCatId && onSetFilterCatId(fixedIncomeCatId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.subtitle}</p>
                  </div>
                  <Badge variant="secondary">Renda Fixa</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{fmt(row.total)}</p>
                  <p
                    className={`text-sm font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                  >
                    {formatPercent(ret)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {row.pct.toFixed(1)}% da carteira
                </p>
              </div>
            )
          }

          const a = row.asset
          const totalAtual = a.currentPrice * a.quantity
          const cost = a.avgPrice * a.quantity
          const ret = cost > 0 ? ((totalAtual - cost) / cost) * 100 : 0
          const baseValue = filterCatId === ALL ? totalValue : filteredTotal
          const pct = baseValue > 0 ? (totalAtual / baseValue) * 100 : 0
          const cat = categories.find((c) => c.id === a.categoryId)
          const flatFI = isFlatFixedIncome(a)

          return (
            <div
              key={a.id}
              tabIndex={0}
              onClick={() => onNavigateToAnalysis(a.ticker)}
              onKeyDown={(e) => e.key === 'Enter' && onNavigateToAnalysis(a.ticker)}
              className={`rounded-lg border border-border px-4 py-3 cursor-pointer ${ret >= 0 ? 'bg-success/5 hover:bg-success/10' : 'bg-destructive/5 hover:bg-destructive/10'} transition-colors`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm flex items-center gap-1.5 flex-wrap">
                    {a.type === 'fixed_income' ? getFiLabel(a) : a.name}
                    {a.pauseAporte && (
                      <PauseCircle size={12} className="text-destructive shrink-0" />
                    )}
                    {!a.pauseAporte && a.ceilingPrice && a.currentPrice >= a.ceilingPrice && (
                      <TrendingDown size={12} className="text-destructive shrink-0" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {flatFI ? (a.institution ?? a.ticker) : a.ticker}
                    {a.maturityDate && (
                      <span className="ml-1.5 text-muted-foreground/70">
                        · venc. {a.maturityDate.slice(5, 7)}/{a.maturityDate.slice(0, 4)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cat ? (
                    <Badge variant="secondary" style={{ borderColor: cat.color, color: cat.color }}>
                      {cat.name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{typeLabel[a.type]}</Badge>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditAsset(a)
                    }}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{fmt(totalAtual)}</p>
                <p
                  className={`text-sm font-semibold ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {formatPercent(ret)}
                </p>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {flatFI
                    ? `Invest. ${fmt(cost)}`
                    : `${formatQuantity(a.quantity)} cotas · PM ${fmt(a.avgPrice)}`}
                </span>
                <span>
                  {pct.toFixed(1)}% {filterCatId === ALL ? 'cart.' : 'cat.'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )

    return (
      <>
        {mobileCards}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {(
                  [
                    { col: 'ticker', label: 'Ativo', align: 'left' },
                    { col: 'tipo', label: 'Tipo', align: 'left' },
                    { col: 'qty', label: 'Qtd', align: 'right' },
                    { col: 'pm', label: 'PM', align: 'right' },
                    { col: 'cost', label: 'Total investido', align: 'right' },
                    { col: 'price', label: 'Preço atual', align: 'right' },
                    { col: 'total', label: 'Total atual', align: 'right' },
                    { col: null, label: 'Recomendado', align: 'right' },
                    { col: 'ret', label: 'Resultado', align: 'right' },
                    {
                      col: 'pct',
                      label: filterCatId === ALL ? '% Cart.' : '% Cat.',
                      align: 'right',
                    },
                  ] as const
                ).map(({ col, label, align }, idx) => (
                  <th
                    key={label}
                    className={`pb-2 font-medium ${idx === 0 ? 'pl-3' : ''} ${align === 'right' ? 'text-right' : ''} ${col ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
                    onClick={col ? () => onToggleSort(col) : undefined}
                  >
                    <span
                      className={`inline-flex items-center gap-0.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}
                    >
                      {label}
                      {col && sortCol === col ? (
                        sortDir === 'asc' ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )
                      ) : null}
                    </span>
                  </th>
                ))}
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                if (row.kind === 'group') return renderGroupRow(row)
                const a = row.asset
                const totalAtual = a.currentPrice * a.quantity
                const cost = a.avgPrice * a.quantity
                const ret = cost > 0 ? ((totalAtual - cost) / cost) * 100 : 0
                const baseValue = filterCatId === ALL ? totalValue : filteredTotal
                const pct = baseValue > 0 ? (totalAtual / baseValue) * 100 : 0
                const targetPct = assetTargets.get(a.id) ?? 0
                const cat = categories.find((c) => c.id === a.categoryId)
                const catCurrentValue = assets
                  .filter((x) => x.categoryId === a.categoryId)
                  .reduce((s, x) => s + x.currentPrice * x.quantity, 0)
                const withinCatRatio =
                  cat && cat.targetPercent > 0 ? targetPct / cat.targetPercent : 0
                const recommended = withinCatRatio * catCurrentValue

                const flatFI = isFlatFixedIncome(a)
                return (
                  <tr
                    key={a.id}
                    onClick={() => onNavigateToAnalysis(a.ticker)}
                    className={`border-b border-border last:border-0 transition-colors cursor-pointer ${ret >= 0 ? 'bg-success/5 hover:bg-success/10' : 'bg-destructive/5 hover:bg-destructive/10'}`}
                  >
                    <td className="py-3 pl-3">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        {a.type === 'fixed_income' ? getFiLabel(a) : a.name}
                        {a.pauseAporte && (
                          <span title="Aporte pausado manualmente">
                            <PauseCircle size={12} className="text-destructive shrink-0" />
                          </span>
                        )}
                        {!a.pauseAporte && a.ceilingPrice && a.currentPrice >= a.ceilingPrice && (
                          <span title={`Preço teto atingido (R$ ${a.ceilingPrice})`}>
                            <TrendingDown size={12} className="text-destructive shrink-0" />
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isFlatFixedIncome(a) ? (a.institution ?? a.ticker) : a.ticker}
                        {a.maturityDate && (
                          <span className="ml-1.5 text-muted-foreground/70">
                            · venc. {a.maturityDate.slice(5, 7)}/{a.maturityDate.slice(0, 4)}
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="py-3">
                      {cat ? (
                        <Badge
                          variant="secondary"
                          style={{ borderColor: cat.color, color: cat.color }}
                        >
                          {cat.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{typeLabel[a.type]}</Badge>
                      )}
                    </td>
                    <td className="py-3 text-right text-foreground">
                      {flatFI ? '—' : formatQuantity(a.quantity)}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {flatFI ? '—' : fmt(a.avgPrice)}
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">{fmt(cost)}</td>
                    <td className="py-3 text-right text-foreground">
                      {flatFI ? '—' : fmt(a.currentPrice)}
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">
                      {fmt(totalAtual)}
                    </td>
                    <td className="py-3 text-right">
                      {a.type === 'fixed_income' || a.type === 'tesouro' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <p className="font-medium text-foreground">{fmt(recommended)}</p>
                      )}
                    </td>
                    <td
                      className={`py-3 text-right font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                    >
                      {formatPercent(ret)}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{pct.toFixed(1)}%</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditAsset(a)
                        }}
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  },
)
