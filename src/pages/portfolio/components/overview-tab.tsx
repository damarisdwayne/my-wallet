import { useMemo, useState } from 'react'
import { Pencil, Plus, RefreshCw, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { B3Asset } from '@/services/b3-import'
import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'
import { ALL, typeLabel } from '../constants'
import { computeAssetTargets } from '../compute-targets'
import { AddAssetDialog } from './add-asset-dialog'
import { BrokerImportDialog } from './broker-import-dialog'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  totalValue: number
  addAsset: (asset: Asset) => Promise<void>
  addManualTrade: (trade: Omit<import('@/types').Trade, 'id' | 'source'>) => Promise<void>
  editAsset: (assetId: string, data: Partial<Asset>) => Promise<void>
  deleteAsset: (assetId: string) => Promise<void>
  importFromB3: (
    assets: B3Asset[],
    trades: import('@/services/b3-import').B3RawTrade[],
    filename: string,
  ) => Promise<void>
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
  addManualTrade,
  editAsset,
  deleteAsset,
  importFromB3,
  refreshPrices,
  refreshingPrices,
  priceError,
}: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [filterCatId, setFilterCatId] = useState<string | typeof ALL>(ALL)
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [brokerImportOpen, setBrokerImportOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editTicker, setEditTicker] = useState('')
  const [editName, setEditName] = useState('')
  const [splitRatio, setSplitRatio] = useState('')
  const [saving, setSaving] = useState(false)

  const openEdit = (a: Asset) => {
    setEditingAsset(a)
    setEditCategoryId(a.categoryId)
    setEditTicker(a.ticker)
    setEditName(a.name)
    setSplitRatio('')
  }

  const handleEditSave = async () => {
    if (!editingAsset) return
    setSaving(true)
    try {
      const newTicker = editTicker.trim().toUpperCase()
      const ratio = splitRatio ? Number(splitRatio) : null
      const srcQty =
        ratio && ratio > 0 && ratio !== 1
          ? Math.round(editingAsset.quantity * ratio)
          : editingAsset.quantity
      const srcAvg =
        ratio && ratio > 0 && ratio !== 1 ? editingAsset.avgPrice / ratio : editingAsset.avgPrice

      const duplicate = assets.find(
        (a) => a.id !== editingAsset.id && a.ticker.toUpperCase() === newTicker,
      )

      if (duplicate) {
        const mergedQty = duplicate.quantity + srcQty
        const mergedAvg = (duplicate.quantity * duplicate.avgPrice + srcQty * srcAvg) / mergedQty
        await editAsset(duplicate.id, { quantity: mergedQty, avgPrice: mergedAvg })
        await deleteAsset(editingAsset.id)
      } else {
        const updates: Partial<Asset> = {
          categoryId: editCategoryId,
          ticker: newTicker,
          name: editName.trim(),
        }
        if (ratio && ratio > 0 && ratio !== 1) {
          updates.quantity = srcQty
          updates.avgPrice = srcAvg
        }
        await editAsset(editingAsset.id, updates)
      }
      setEditingAsset(null)
    } finally {
      setSaving(false)
    }
  }

  const activeCategories = useMemo(
    () => categories.filter((c) => assets.some((a) => a.categoryId === c.id)),
    [categories, assets],
  )

  const filteredAssets = useMemo(
    () => (filterCatId === ALL ? assets : assets.filter((a) => a.categoryId === filterCatId)),
    [filterCatId, assets],
  )

  const valueByCat = useMemo(
    () =>
      activeCategories.reduce(
        (acc, cat) => {
          const v = assets
            .filter((a) => a.categoryId === cat.id)
            .reduce((s, a) => s + a.currentPrice * a.quantity, 0)
          return { ...acc, [cat.id]: v }
        },
        {} as Record<string, number>,
      ),
    [activeCategories, assets],
  )

  const filteredTotal = filteredAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
  const activeCat = filterCatId === ALL ? null : categories.find((c) => c.id === filterCatId)

  const fixedIncomeCatId = useMemo(
    () => categories.find((c) => c.type === 'fixed_income')?.id ?? null,
    [categories],
  )
  const showingFixedIncomeDetail = filterCatId !== ALL && filterCatId === fixedIncomeCatId

  type AssetRow = { kind: 'asset'; asset: Asset }
  type GroupRow = {
    kind: 'group'
    label: string
    subtitle: string
    total: number
    cost: number
    recommended: number
    diff: number
    pct: number
  }
  type TableRow = AssetRow | GroupRow

  const tableRows = useMemo((): TableRow[] => {
    if (showingFixedIncomeDetail) {
      return filteredAssets.map((a) => ({ kind: 'asset', asset: a }))
    }
    const fixedItems = filteredAssets.filter((a) => a.type === 'fixed_income')
    const otherItems = filteredAssets.filter((a) => a.type !== 'fixed_income')
    const rows: TableRow[] = otherItems.map((a) => ({ kind: 'asset', asset: a }))
    if (fixedItems.length > 0) {
      const total = fixedItems.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
      const cost = fixedItems.reduce((s, a) => s + a.avgPrice * a.quantity, 0)
      const fiCat = categories.find((c) => c.type === 'fixed_income')
      const recommended = fiCat ? (fiCat.targetPercent / 100) * totalValue : 0
      const baseValue = filterCatId === ALL ? totalValue : filteredTotal
      rows.push({
        kind: 'group',
        label: 'Renda Fixa',
        subtitle: `${fixedItems.length} ${fixedItems.length === 1 ? 'ativo' : 'ativos'}`,
        total,
        cost,
        recommended,
        diff: total - recommended,
        pct: baseValue > 0 ? (total / baseValue) * 100 : 0,
      })
    }
    return rows
  }, [filteredAssets, showingFixedIncomeDetail, categories, totalValue, filteredTotal, filterCatId])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            {activeCat ? activeCat.name : 'Patrimônio total'}
          </p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(filteredTotal)}</p>
          {activeCat && (
            <p className="text-xs text-muted-foreground">
              {((filteredTotal / totalValue) * 100).toFixed(1)}% da carteira
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCatId(ALL)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterCatId === ALL
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCatId(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCatId === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activeCategories.map((cat) => {
          const val = valueByCat[cat.id] ?? 0
          const pct = (val / totalValue) * 100
          const isActive = filterCatId === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCatId(filterCatId === cat.id ? ALL : cat.id)}
              className="text-left"
            >
              <Card
                className={`transition-colors ${isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <CardTitle>{cat.name}</CardTitle>
                  </div>
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
              <th className="pb-2 font-medium text-right">
                {filterCatId === ALL ? '% Cart.' : '% Cat.'}
              </th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => {
              if (row.kind === 'group') {
                const ret = row.cost > 0 ? ((row.total - row.cost) / row.cost) * 100 : 0
                return (
                  <tr
                    key="fi-group"
                    className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => fixedIncomeCatId && setFilterCatId(fixedIncomeCatId)}
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
                    <td className="py-3 text-right text-muted-foreground">—</td>
                    <td className="py-3 text-right font-medium text-foreground">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="py-3 text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(row.recommended)}
                      </p>
                      <p
                        className={`text-xs ${row.diff >= 0 ? 'text-success' : 'text-destructive'}`}
                      >
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
              const a = row.asset
              const total = a.currentPrice * a.quantity
              const cost = a.avgPrice * a.quantity
              const ret = cost > 0 ? ((total - cost) / cost) * 100 : 0
              const baseValue = filterCatId === ALL ? totalValue : filteredTotal
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
                    {(() => {
                      const cat = categories.find((c) => c.id === a.categoryId)
                      return cat ? (
                        <Badge
                          variant="secondary"
                          style={{ borderColor: cat.color, color: cat.color }}
                        >
                          {cat.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{typeLabel[a.type]}</Badge>
                      )
                    })()}
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
                      {diff >= 0 ? '+' : ''}
                      {formatCurrency(diff)}
                    </p>
                  </td>
                  <td
                    className={`py-3 text-right font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                  >
                    {formatPercent(ret)}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">{pct.toFixed(1)}%</td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => openEdit(a)}
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

      <AddAssetDialog
        open={addAssetOpen}
        onOpenChange={setAddAssetOpen}
        categories={categories}
        assets={assets}
        onAdd={addAsset}
        onAddTrade={addManualTrade}
      />

      <BrokerImportDialog
        open={brokerImportOpen}
        onOpenChange={setBrokerImportOpen}
        existingAssets={assets}
        onImport={importFromB3}
      />

      <Dialog open={!!editingAsset} onOpenChange={(v) => !v && setEditingAsset(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar {editingAsset?.ticker}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-ticker" className="text-xs text-muted-foreground mb-1 block">
                  Ticker
                </label>
                <input
                  id="edit-ticker"
                  className={inputClass}
                  value={editTicker}
                  onChange={(e) => setEditTicker(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-name" className="text-xs text-muted-foreground mb-1 block">
                  Nome
                </label>
                <input
                  id="edit-name"
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-category" className="text-xs text-muted-foreground mb-1 block">
                Categoria
              </label>
              <select
                id="edit-category"
                className={inputClass}
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-split" className="text-xs text-muted-foreground mb-1 block">
                Desdobramento / Grupamento{' '}
                <span className="text-muted-foreground/60">(ex: 2 = dobra qtd, 0.5 = agrupa)</span>
              </label>
              <input
                id="edit-split"
                type="number"
                min="0.01"
                step="any"
                placeholder="1 = sem alteração"
                className={inputClass}
                value={splitRatio}
                onChange={(e) => setSplitRatio(e.target.value)}
              />
              {splitRatio && Number(splitRatio) > 0 && Number(splitRatio) !== 1 && editingAsset && (
                <p className="text-xs text-muted-foreground mt-1">
                  {editingAsset.quantity} → {Math.round(editingAsset.quantity * Number(splitRatio))}{' '}
                  cotas · PM {formatCurrency(editingAsset.avgPrice)} →{' '}
                  {formatCurrency(editingAsset.avgPrice / Number(splitRatio))}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setEditingAsset(null)}
              className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditSave}
              disabled={saving}
              className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
