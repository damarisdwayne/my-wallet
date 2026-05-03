import { useMemo, useState } from 'react'
import { ALL } from '../../../constants'
import { computeAssetTargets } from '../../../compute-targets'
import { AddAssetDialog, BrokerImportDialog } from '../../dialog'
import type { TableRow, OverviewTabProps } from './constants'
import { compareAssets } from './utils'
import {
  CategoryFilter,
  CategoryCards,
  Toolbar,
  AssetsTable,
  EditAssetDialog,
} from './components'

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
}: OverviewTabProps) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [filterCatId, setFilterCatId] = useState<string | typeof ALL>(ALL)
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [brokerImportOpen, setBrokerImportOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<import('@/types').Asset | null>(null)
  const [sortCol, setSortCol] = useState<import('./constants').SortCol>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortCol(col)
      setSortDir(col === 'ticker' || col === 'tipo' ? 'asc' : 'desc')
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

  const tableRows = useMemo((): TableRow[] => {
    const baseValue = filterCatId === ALL ? totalValue : filteredTotal

    const sortAssets = (items: import('@/types').Asset[]): import('@/types').Asset[] =>
      [...items].sort((a, b) => compareAssets(a, b, sortCol, sortDir, baseValue, categories))

    if (showingFixedIncomeDetail) {
      return sortAssets(filteredAssets).map((a) => ({ kind: 'asset', asset: a }))
    }
    const fixedItems = filteredAssets.filter((a) => a.type === 'fixed_income')
    const otherItems = filteredAssets.filter((a) => a.type !== 'fixed_income')
    const rows: TableRow[] = sortAssets(otherItems).map((a) => ({ kind: 'asset', asset: a }))
    if (fixedItems.length > 0) {
      const total = fixedItems.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
      const cost = fixedItems.reduce((s, a) => s + a.avgPrice * a.quantity, 0)
      const fiCat = categories.find((c) => c.type === 'fixed_income')
      const recommended = fiCat ? (fiCat.targetPercent / 100) * totalValue : 0
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
  }, [
    filteredAssets,
    showingFixedIncomeDetail,
    categories,
    totalValue,
    filteredTotal,
    filterCatId,
    sortCol,
    sortDir,
  ])

  return (
    <div className="space-y-5">
      <CategoryFilter
        activeCat={activeCat ?? null}
        filteredTotal={filteredTotal}
        totalValue={totalValue}
        activeCategories={activeCategories}
        filterCatId={filterCatId}
        onSetFilterCatId={setFilterCatId}
      />

      <CategoryCards
        activeCategories={activeCategories}
        valueByCat={valueByCat}
        totalValue={totalValue}
        filterCatId={filterCatId}
        onSetFilterCatId={setFilterCatId}
      />

      <Toolbar
        priceError={priceError}
        refreshingPrices={refreshingPrices}
        onRefreshPrices={refreshPrices}
        onOpenBrokerImport={() => setBrokerImportOpen(true)}
        onOpenAddAsset={() => setAddAssetOpen(true)}
      />

      <AssetsTable
        tableRows={tableRows}
        filterCatId={filterCatId}
        sortCol={sortCol}
        sortDir={sortDir}
        categories={categories}
        totalValue={totalValue}
        filteredTotal={filteredTotal}
        assets={assets}
        assetTargets={assetTargets}
        fixedIncomeCatId={fixedIncomeCatId}
        onToggleSort={toggleSort}
        onEditAsset={setEditingAsset}
        onSetFilterCatId={setFilterCatId}
      />

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

      <EditAssetDialog
        asset={editingAsset}
        categories={categories}
        assets={assets}
        onClose={() => setEditingAsset(null)}
        editAsset={editAsset}
        deleteAsset={deleteAsset}
      />
    </div>
  )
}
