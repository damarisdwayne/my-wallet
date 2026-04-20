import { useMemo, useState } from 'react'
import { Plus, RefreshCw, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { B3Asset } from '@/services/b3-import'
import type { Asset, AssetAnswers, AssetType, Diagram, PortfolioCategory } from '@/types'
import { ALL, typeLabel } from '../constants'
import { computeAssetTargets } from '../compute-targets'
import { AddAssetDialog } from './add-asset-dialog'
import { BrokerImportDialog } from './broker-import-dialog'

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  totalValue: number
  addAsset: (asset: Asset) => Promise<void>
  importFromB3: (assets: B3Asset[], filename: string) => Promise<void>
  refreshPrices: () => Promise<void>
  refreshingPrices: boolean
  priceError: string | null
}

export const OverviewTab = ({
  assets,
  categories,
  diagrams,
  answers,
  totalValue,
  addAsset,
  importFromB3,
  refreshPrices,
  refreshingPrices,
  priceError,
}: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [filterType, setFilterType] = useState<AssetType | typeof ALL>(ALL)
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [brokerImportOpen, setBrokerImportOpen] = useState(false)

  const availableTypes = useMemo(
    () => [...new Set(assets.map((a) => a.type))] as AssetType[],
    [assets],
  )

  const filteredAssets = useMemo(
    () => (filterType === ALL ? assets : assets.filter((a) => a.type === filterType)),
    [filterType, assets],
  )

  const valueByType = useMemo(
    () =>
      availableTypes.reduce(
        (acc, type) => {
          const v = assets
            .filter((a) => a.type === type)
            .reduce((s, a) => s + a.currentPrice * a.quantity, 0)
          return { ...acc, [type]: v }
        },
        {} as Record<string, number>,
      ),
    [availableTypes, assets],
  )

  const filteredTotal = filteredAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            {filterType === ALL ? 'Patrimônio total' : typeLabel[filterType]}
          </p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(filteredTotal)}</p>
          {filterType !== ALL && (
            <p className="text-xs text-muted-foreground">
              {((filteredTotal / totalValue) * 100).toFixed(1)}% da carteira
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType(ALL)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === ALL
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {typeLabel[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {availableTypes.map((type) => {
          const val = valueByType[type] ?? 0
          const pct = (val / totalValue) * 100
          const isActive = filterType === type
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? ALL : type)}
              className="text-left"
            >
              <Card
                className={`transition-colors ${isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}
              >
                <CardHeader className="p-4">
                  <CardTitle>{typeLabel[type]}</CardTitle>
                  <p className="text-base font-bold text-foreground mt-1">{formatCurrency(val)}</p>
                  <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% da carteira</p>
                </CardHeader>
              </Card>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        {priceError && <p className="text-xs text-destructive">{priceError}</p>}
        <button
          onClick={refreshPrices}
          disabled={refreshingPrices}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={cn(refreshingPrices && 'animate-spin')} />
          {refreshingPrices ? 'Atualizando...' : 'Atualizar preços'}
        </button>
        <button
          onClick={() => setBrokerImportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <Upload size={14} />
          Importar nota
        </button>
        <button
          onClick={() => setAddAssetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Adicionar ativo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Ativo</th>
              <th className="pb-2 font-medium">Tipo</th>
              <th className="pb-2 font-medium text-right">Qtd</th>
              <th className="pb-2 font-medium text-right">PM</th>
              <th className="pb-2 font-medium text-right">Atual</th>
              <th className="pb-2 font-medium text-right">Total</th>
              <th className="pb-2 font-medium text-right">Recomendado</th>
              <th className="pb-2 font-medium text-right">Resultado</th>
              <th className="pb-2 font-medium text-right">{filterType === ALL ? '% Cart.' : '% Cat.'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((a) => {
              const total = a.currentPrice * a.quantity
              const cost = a.avgPrice * a.quantity
              const ret = cost > 0 ? ((total - cost) / cost) * 100 : 0
              const baseValue = filterType === ALL ? totalValue : filteredTotal
              const pct = baseValue > 0 ? (total / baseValue) * 100 : 0
              const targetPct = assetTargets.get(a.id) ?? 0
              const recommended = (targetPct / 100) * totalValue
              const diff = total - recommended
              return (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                >
                  <td className="py-3">
                    <p className="font-semibold text-foreground">{a.ticker}</p>
                    <p className="text-xs text-muted-foreground">{a.name}</p>
                  </td>
                  <td className="py-3">
                    <Badge variant="secondary">{typeLabel[a.type]}</Badge>
                  </td>
                  <td className="py-3 text-right text-foreground">{a.quantity}</td>
                  <td className="py-3 text-right text-muted-foreground">
                    {formatCurrency(a.avgPrice)}
                  </td>
                  <td className="py-3 text-right text-foreground">
                    {formatCurrency(a.currentPrice)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatCurrency(total)}
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-medium text-foreground">{formatCurrency(recommended)}</p>
                    <p className={`text-xs ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                    </p>
                  </td>
                  <td
                    className={`py-3 text-right font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                  >
                    {formatPercent(ret)}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">{pct.toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AddAssetDialog
        open={addAssetOpen}
        onOpenChange={setAddAssetOpen}
        categories={categories}
        onAdd={addAsset}
      />

      <BrokerImportDialog
        open={brokerImportOpen}
        onOpenChange={setBrokerImportOpen}
        existingAssets={assets}
        onImport={importFromB3}
      />
    </div>
  )
}
