import { useMemo, useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import type { Asset, AssetType, PortfolioCategory } from '@/types'
import { typeLabel } from '../../../constants'

interface CategoriesTabProps {
  assets: Asset[]
  categories: PortfolioCategory[]
  totalValue: number
  editAsset: (id: string, data: Partial<Asset>) => Promise<void>
}

const TYPE_COLORS: Partial<Record<AssetType, string>> = {
  stock: '#3b82f6',
  fii: '#10b981',
  bdr: '#f59e0b',
  etf: '#8b5cf6',
  tesouro: '#0ea5e9',
  fixed_income: '#6366f1',
  crypto: '#ef4444',
  stock_us: '#ec4899',
  etf_us: '#a855f7',
  other: '#6b7280',
}

export const CategoriesTab = ({
  assets,
  categories,
  totalValue,
  editAsset,
}: CategoriesTabProps) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkCatId, setBulkCatId] = useState('')
  const [saving, setSaving] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.ticker.toLowerCase().includes(q) ||
        typeLabel[a.type].toLowerCase().includes(q),
    )
  }, [assets, search])

  const allSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((a) => next.delete(a.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((a) => next.add(a.id))
        return next
      })
    }
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleInlineChange = async (assetId: string, catId: string) => {
    setSaving((prev) => new Set(prev).add(assetId))
    await editAsset(assetId, { categoryId: catId })
    setSaving((prev) => {
      const next = new Set(prev)
      next.delete(assetId)
      return next
    })
  }

  const handleBulkUpdate = async () => {
    if (!bulkCatId || selected.size === 0) return
    const ids = [...selected]
    setSaving(new Set(ids))
    await Promise.all(ids.map((id) => editAsset(id, { categoryId: bulkCatId })))
    setSaving(new Set())
    setSelected(new Set())
    setBulkCatId('')
  }

  const catColor = (catId: string) => categories.find((c) => c.id === catId)?.color

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Buscar ativo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{selected.size} selecionado(s)</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={bulkCatId}
              onChange={(e) => setBulkCatId(e.target.value)}
            >
              <option value="">Atribuir categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkCatId}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} />
              Atualizar selecionados
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-border accent-primary"
                />
              </th>
              <th className="px-3 py-3 font-medium">Ativo</th>
              <th className="px-3 py-3 font-medium">Grupo</th>
              <th className="px-3 py-3 font-medium">Minha categoria</th>
              <th className="px-3 py-3 font-medium text-right">% Patrimônio</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => {
              const pct = totalValue > 0 ? (asset.currentPrice * asset.quantity) / totalValue : 0
              const isSaving = saving.has(asset.id)
              const color = catColor(asset.currentPrice > 0 ? asset.categoryId : '')
              const typeColor = TYPE_COLORS[asset.type] ?? '#6b7280'

              return (
                <tr
                  key={asset.id}
                  className={`border-b border-border last:border-0 transition-colors ${
                    selected.has(asset.id) ? 'bg-primary/5' : 'hover:bg-accent/30'
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(asset.id)}
                      onChange={() => toggleOne(asset.id)}
                      className="rounded border-border accent-primary"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.ticker}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant="secondary"
                      style={{ borderColor: typeColor, color: typeColor }}
                    >
                      {typeLabel[asset.type]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    {isSaving ? (
                      <span className="text-xs text-muted-foreground animate-pulse">
                        Salvando...
                      </span>
                    ) : (
                      <select
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full max-w-48"
                        value={asset.categoryId}
                        onChange={(e) => handleInlineChange(asset.id, e.target.value)}
                        style={color ? { borderColor: color } : undefined}
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-muted-foreground">
                    {formatPercent(pct * 100)}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  Nenhum ativo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
