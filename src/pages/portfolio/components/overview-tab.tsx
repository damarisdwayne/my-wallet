import { useMemo, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { Asset, AssetType, PortfolioCategory } from '@/types'
import { ALL, ASSET_TYPES, typeLabel } from '../constants'

const emptyNewAsset = () => ({
  ticker: '',
  name: '',
  type: 'stock' as AssetType,
  quantity: '',
  avgPrice: '',
  currentPrice: '',
  targetPercent: '10',
  categoryId: '',
  autoCategory: true,
})

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
  addAsset: (asset: Asset) => Promise<void>
  refreshPrices: () => Promise<void>
  refreshingPrices: boolean
  priceError: string | null
}

export const OverviewTab = ({
  assets,
  categories,
  totalValue,
  addAsset,
  refreshPrices,
  refreshingPrices,
  priceError,
}: Props) => {
  const [filterType, setFilterType] = useState<AssetType | typeof ALL>(ALL)
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [newAsset, setNewAsset] = useState(emptyNewAsset())

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

  const handleAddAsset = async () => {
    const ticker = newAsset.ticker.trim().toUpperCase()
    const name = newAsset.name.trim()
    if (!ticker || !name) return
    const autoCatId = categories.find((c) => c.type === newAsset.type)?.id ?? ''
    const resolvedCategoryId = newAsset.autoCategory ? autoCatId : newAsset.categoryId
    const asset: Asset = {
      id: `asset-${Date.now()}`,
      ticker,
      name,
      type: newAsset.type,
      categoryId: resolvedCategoryId,
      quantity: parseFloat(newAsset.quantity) || 0,
      avgPrice: parseFloat(newAsset.avgPrice) || 0,
      currentPrice: parseFloat(newAsset.currentPrice) || 0,
      targetPercent: parseFloat(newAsset.targetPercent) || 0,
    }
    await addAsset(asset)
    setNewAsset(emptyNewAsset())
    setAddAssetOpen(false)
  }

  const autoCatId = categories.find((c) => c.type === newAsset.type)?.id ?? ''
  const resolvedCatName = newAsset.autoCategory
    ? (categories.find((c) => c.id === autoCatId)?.name ?? 'Nenhuma categoria encontrada')
    : (categories.find((c) => c.id === newAsset.categoryId)?.name ?? '—')

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
        {priceError && (
          <p className="text-xs text-destructive">{priceError}</p>
        )}
        <button
          onClick={refreshPrices}
          disabled={refreshingPrices}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={cn(refreshingPrices && 'animate-spin')} />
          {refreshingPrices ? 'Atualizando...' : 'Atualizar preços'}
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
              <th className="pb-2 font-medium text-right">Resultado</th>
              <th className="pb-2 font-medium text-right">% Cart.</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((a) => {
              const total = a.currentPrice * a.quantity
              const cost = a.avgPrice * a.quantity
              const ret = cost > 0 ? ((total - cost) / cost) * 100 : 0
              const pct = totalValue > 0 ? (total / totalValue) * 100 : 0
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

      <Dialog
        open={addAssetOpen}
        onOpenChange={(open) => {
          setAddAssetOpen(open)
          if (!open) setNewAsset(emptyNewAsset())
        }}
      >
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar ativo</DialogTitle>
            <DialogDescription>
              Preencha os dados do ativo e vincule uma categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ticker</label>
                <input
                  className={inputClass}
                  placeholder="PETR4"
                  value={newAsset.ticker}
                  onChange={(e) => setNewAsset((p) => ({ ...p, ticker: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                <select
                  className={inputClass}
                  value={newAsset.type}
                  onChange={(e) =>
                    setNewAsset((p) => ({
                      ...p,
                      type: e.target.value as AssetType,
                      categoryId: '',
                    }))
                  }
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <input
                className={inputClass}
                placeholder="Petrobras PN"
                value={newAsset.name}
                onChange={(e) => setNewAsset((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  placeholder="100"
                  value={newAsset.quantity}
                  onChange={(e) => setNewAsset((p) => ({ ...p, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">PM (R$)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="30.00"
                  value={newAsset.avgPrice}
                  onChange={(e) => setNewAsset((p) => ({ ...p, avgPrice: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Atual (R$)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="35.00"
                  value={newAsset.currentPrice}
                  onChange={(e) => setNewAsset((p) => ({ ...p, currentPrice: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                % alvo na categoria
              </label>
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={newAsset.targetPercent}
                onChange={(e) => setNewAsset((p) => ({ ...p, targetPercent: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setNewAsset((p) => ({ ...p, autoCategory: true, categoryId: '' }))}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                    newAsset.autoCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  Detectar automaticamente
                </button>
                <button
                  onClick={() => setNewAsset((p) => ({ ...p, autoCategory: false }))}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                    !newAsset.autoCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  Selecionar manualmente
                </button>
              </div>
              {newAsset.autoCategory ? (
                <p className="text-xs px-3 py-2 rounded-md bg-muted text-muted-foreground">
                  Categoria detectada:{' '}
                  <span className="text-foreground font-medium">{resolvedCatName}</span>
                </p>
              ) : (
                <select
                  className={inputClass}
                  value={newAsset.categoryId}
                  onChange={(e) => setNewAsset((p) => ({ ...p, categoryId: e.target.value }))}
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({typeLabel[c.type]})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setAddAssetOpen(false)}
              className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddAsset}
              className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Adicionar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
