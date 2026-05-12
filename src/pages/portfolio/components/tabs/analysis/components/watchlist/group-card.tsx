import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2, Pencil, Check, X } from 'lucide-react'
import type { AssetType, WatchlistAsset, WatchlistField, WatchlistGroup, WatchlistVerdict } from '@/types'
import { WatchlistTable } from './watchlist-table'

interface Props {
  group: WatchlistGroup
  assets: WatchlistAsset[]
  onEditGroup: (name: string, description?: string) => void
  onDeleteGroup: () => void
  onAddAsset: (ticker: string, name: string, type: AssetType) => void
  onUpdateGroupFields: (fields: WatchlistField[]) => void
  onSetFieldValue: (assetId: string, fieldId: string, value: string) => void
  onSetVerdict: (assetId: string, verdict: WatchlistVerdict) => void
  onDeleteAsset: (assetId: string) => void
}

export const WatchlistGroupCard = ({
  group,
  assets,
  onEditGroup,
  onDeleteGroup,
  onAddAsset,
  onUpdateGroupFields,
  onSetFieldValue,
  onSetVerdict,
  onDeleteAsset,
}: Props) => {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)
  const [editDesc, setEditDesc] = useState(group.description ?? '')
  const [addAssetOpen, setAddAssetOpen] = useState(false)

  const saveEdit = () => {
    if (!editName.trim()) return
    onEditGroup(editName.trim(), editDesc.trim() || undefined)
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditName(group.name)
    setEditDesc(group.description ?? '')
    setEditing(false)
  }

  const buyCount = assets.filter((a) => a.verdict === 'buy').length
  const watchCount = assets.filter((a) => a.verdict === 'watch').length

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-card">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {editing ? (
          <div className="flex-1 flex flex-col sm:flex-row gap-1.5 sm:items-center">
            <input
              className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              autoFocus
            />
            <input
              className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Descrição..."
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="flex gap-1 self-end sm:self-auto">
              <button onClick={saveEdit} className="p-1 text-success hover:text-success/80">
                <Check size={15} />
              </button>
              <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-foreground truncate">{group.name}</p>
              {assets.length > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {assets.length} ativo{assets.length !== 1 ? 's' : ''}
                </span>
              )}
              {buyCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30 shrink-0">
                  {buyCount} comprar
                </span>
              )}
              {watchCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/30 shrink-0">
                  {watchCount} observar
                </span>
              )}
            </div>
            {group.description && (
              <p className="text-xs text-muted-foreground truncate">{group.description}</p>
            )}
          </div>
        )}

        {editing ? null : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Editar categoria"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDeleteGroup}
              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Excluir categoria"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-muted/20">
          <WatchlistTable
            group={group}
            assets={assets}
            addAssetOpen={addAssetOpen}
            onOpenAddAsset={() => setAddAssetOpen(true)}
            onCloseAddAsset={() => setAddAssetOpen(false)}
            onUpdateGroupFields={onUpdateGroupFields}
            onSetFieldValue={onSetFieldValue}
            onSetVerdict={onSetVerdict}
            onAddAsset={onAddAsset}
            onDeleteAsset={onDeleteAsset}
          />
        </div>
      )}
    </div>
  )
}
