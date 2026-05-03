import { memo } from 'react'
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent, formatQuantity } from '@/lib/utils'
import { ALL, typeLabel } from '../../../../constants'
import type { TableRow, SortCol } from '../constants'
import type { Asset, PortfolioCategory } from '@/types'
import { isFlatFixedIncome } from '../utils'

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
  }: AssetsTableProps) => {
    const renderGroupRow = (row: Extract<TableRow, { kind: 'group' }>) => {
      const ret = row.cost > 0 ? ((row.total - row.cost) / row.cost) * 100 : 0
      return (
        <tr
          key="fi-group"
          className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer"
          onClick={() => fixedIncomeCatId && onSetFilterCatId(fixedIncomeCatId)}
        >
          <td className="py-3">
            <p className="font-semibold text-foreground">{row.label}</p>
            <p className="text-xs text-muted-foreground">{row.subtitle}</p>
          </td>
          <td className="py-3">
            <Badge variant="secondary">Renda Fixa</Badge>
          </td>
          <td className="py-3 text-right text-muted-foreground">—</td>
          <td className="py-3 text-right text-muted-foreground">—</td>
          <td className="py-3 text-right font-medium text-foreground">
            {formatCurrency(row.cost)}
          </td>
          <td className="py-3 text-right text-muted-foreground">—</td>
          <td className="py-3 text-right font-medium text-foreground">
            {formatCurrency(row.total)}
          </td>
          <td className="py-3 text-right">
            <p className="font-medium text-foreground">{formatCurrency(row.recommended)}</p>
            <p className={`text-xs ${row.diff >= 0 ? 'text-success' : 'text-destructive'}`}>
              {row.diff >= 0 ? '+' : ''}
              {formatCurrency(row.diff)}
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

    return (
      <div className="overflow-x-auto">
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
                  { col: 'pct', label: filterCatId === ALL ? '% Cart.' : '% Cat.', align: 'right' },
                ] as const
              ).map(({ col, label, align }) => (
                <th
                  key={label}
                  className={`pb-2 font-medium ${align === 'right' ? 'text-right' : ''} ${col ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
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
                  className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                >
                  <td className="py-3">
                    <p className="font-semibold text-foreground">{a.name}</p>
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
                    {flatFI ? '—' : formatCurrency(a.avgPrice)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatCurrency(cost)}
                  </td>
                  <td className="py-3 text-right text-foreground">
                    {flatFI ? '—' : formatCurrency(a.currentPrice)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatCurrency(totalAtual)}
                  </td>
                  <td className="py-3 text-right">
                    {a.type === 'fixed_income' || a.type === 'tesouro' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <>
                        <p className="font-medium text-foreground">{formatCurrency(recommended)}</p>
                      </>
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
                      onClick={() => onEditAsset(a)}
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
    )
  },
)
