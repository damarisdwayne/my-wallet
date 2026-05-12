import { useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Check, Eye, X, Trash2 } from 'lucide-react'
import type {
  AssetType,
  WatchlistAsset,
  WatchlistField,
  WatchlistGroup,
  WatchlistVerdict,
} from '@/types'
import { AddWatchlistAssetDialog } from './add-asset-dialog'

const VERDICT_STYLE: Record<WatchlistVerdict, string> = {
  none: 'text-muted-foreground/30 hover:text-muted-foreground',
  buy: 'text-success',
  watch: 'text-warning',
  pass: 'text-destructive',
}

const VerdictIcons = ({
  verdict,
  onChange,
}: {
  verdict: WatchlistVerdict
  onChange: (v: WatchlistVerdict) => void
}) => {
  const toggle = (v: WatchlistVerdict) => onChange(verdict === v ? 'none' : v)
  return (
    <div className="flex items-center justify-center gap-1.5 mt-1">
      <button
        onClick={() => toggle('buy')}
        title="Comprar"
        className={`p-1 rounded transition-colors ${VERDICT_STYLE[verdict === 'buy' ? 'buy' : 'none']}`}
      >
        <Check size={13} />
      </button>
      <button
        onClick={() => toggle('watch')}
        title="Observar"
        className={`p-1 rounded transition-colors ${VERDICT_STYLE[verdict === 'watch' ? 'watch' : 'none']}`}
      >
        <Eye size={13} />
      </button>
      <button
        onClick={() => toggle('pass')}
        title="Passar"
        className={`p-1 rounded transition-colors ${VERDICT_STYLE[verdict === 'pass' ? 'pass' : 'none']}`}
      >
        <X size={13} />
      </button>
    </div>
  )
}

const cellInput =
  'w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 text-center outline-none px-1 py-1 rounded focus:bg-background focus:ring-1 focus:ring-ring transition-colors'

interface Props {
  group: WatchlistGroup
  assets: WatchlistAsset[]
  addAssetOpen: boolean
  onOpenAddAsset: () => void
  onCloseAddAsset: () => void
  onUpdateGroupFields: (fields: WatchlistField[]) => void
  onSetFieldValue: (assetId: string, fieldId: string, value: string) => void
  onSetVerdict: (assetId: string, verdict: WatchlistVerdict) => void
  onAddAsset: (ticker: string, name: string, type: AssetType) => void
  onDeleteAsset: (assetId: string) => void
}

export const WatchlistTable = ({
  group,
  assets,
  addAssetOpen,
  onOpenAddAsset,
  onCloseAddAsset,
  onUpdateGroupFields,
  onSetFieldValue,
  onSetVerdict,
  onAddAsset,
  onDeleteAsset,
}: Props) => {
  const [newFieldName, setNewFieldName] = useState('')
  const [addingField, setAddingField] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [editingFieldName, setEditingFieldName] = useState('')
  const newFieldInputRef = useRef<HTMLInputElement>(null)

  const fields = group.fields ?? []

  const addField = () => {
    if (!newFieldName.trim()) return
    onUpdateGroupFields([...fields, { id: nanoid(), name: newFieldName.trim() }])
    setNewFieldName('')
    setAddingField(false)
  }

  const renameField = (fieldId: string) => {
    if (!editingFieldName.trim()) return
    onUpdateGroupFields(
      fields.map((f) => (f.id === fieldId ? { ...f, name: editingFieldName.trim() } : f)),
    )
    setEditingFieldId(null)
  }

  const deleteField = (fieldId: string) =>
    onUpdateGroupFields(fields.filter((f) => f.id !== fieldId))

  const startAddingField = () => {
    setAddingField(true)
    setTimeout(() => newFieldInputRef.current?.focus(), 50)
  }

  if (assets.length === 0) {
    return (
      <>
        <button
          onClick={onOpenAddAsset}
          className="w-full py-6 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          + Adicionar primeiro ativo
        </button>
        <AddWatchlistAssetDialog open={addAssetOpen} onClose={onCloseAddAsset} onAdd={onAddAsset} />
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-muted/40 text-left px-3 py-2 font-medium text-muted-foreground text-xs w-28 min-w-28">
                  Campo
                </th>
                {assets.map((asset) => (
                  <th key={asset.id} className="bg-muted/40 px-3 min-w-32 w-36 py-2">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-foreground text-xs">
                          {asset.ticker}
                        </span>
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-28 font-normal">
                        {asset.name}
                      </span>
                      {/* Verdict lives in the header, tied to each asset */}
                      <VerdictIcons
                        verdict={asset.verdict}
                        onChange={(v) => onSetVerdict(asset.id, v)}
                      />
                    </div>
                  </th>
                ))}
                <th className="bg-muted/40 px-2 text-right">
                  <button
                    onClick={onOpenAddAsset}
                    title="Adicionar ativo"
                    className="p-1 rounded text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {fields.map((field, i) => (
                <tr
                  key={field.id}
                  className={`border-b border-border/60 hover:bg-muted/20 transition-colors group ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                >
                  <td className="sticky left-0 z-10 bg-card px-3 py-1.5 group-hover:bg-muted/20">
                    {editingFieldId === field.id ? (
                      <input
                        className="w-full bg-background border border-input rounded px-1.5 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                        value={editingFieldName}
                        autoFocus
                        onChange={(e) => setEditingFieldName(e.target.value)}
                        onBlur={() => renameField(field.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') renameField(field.id)
                          if (e.key === 'Escape') setEditingFieldId(null)
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors text-left flex-1 truncate"
                          onClick={() => {
                            setEditingFieldId(field.id)
                            setEditingFieldName(field.name)
                          }}
                          title="Clique para renomear"
                        >
                          {field.name}
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-destructive transition-all shrink-0"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}
                  </td>
                  {assets.map((asset) => (
                    <td key={asset.id} className="px-2 py-1 border-l border-border/40">
                      <input
                        className={cellInput}
                        placeholder="—"
                        defaultValue={asset.fieldValues?.[field.id] ?? ''}
                        onBlur={(e) => onSetFieldValue(asset.id, field.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      />
                    </td>
                  ))}
                  <td />
                </tr>
              ))}

              {fields.length === 0 && (
                <tr>
                  <td
                    colSpan={assets.length + 2}
                    className="px-3 py-4 text-center text-xs text-muted-foreground"
                  >
                    Nenhum campo ainda. Adicione abaixo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add field — fora da tabela */}
        {addingField ? (
          <input
            ref={newFieldInputRef}
            className="w-full h-8 bg-background border border-input rounded-md px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder="Nome do campo, ex: DY, P/VP, P/L..."
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onBlur={() => {
              if (newFieldName.trim()) addField()
              else setAddingField(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addField()
              if (e.key === 'Escape') {
                setNewFieldName('')
                setAddingField(false)
              }
            }}
          />
        ) : (
          <button
            onClick={startAddingField}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-1"
          >
            <Plus size={12} />
            Adicionar campo
          </button>
        )}
      </div>

      <AddWatchlistAssetDialog open={addAssetOpen} onClose={onCloseAddAsset} onAdd={onAddAsset} />
    </>
  )
}
