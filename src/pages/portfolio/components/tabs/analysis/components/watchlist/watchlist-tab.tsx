import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWatchlist } from '@/hooks/use-watchlist'
import { WatchlistGroupCard } from './group-card'

const inputClass =
  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  uid: string | null
}

export const WatchlistTab = ({ uid }: Props) => {
  const { groups, assets, loaded, createGroup, editGroup, updateGroupFields, removeGroup, addAsset, setVerdict, setFieldValue, removeAsset } =
    useWatchlist(uid)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createGroup(newName.trim(), newDesc.trim() || undefined)
    setNewName('')
    setNewDesc('')
    setCreateOpen(false)
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Compare ativos lado a lado antes de decidir onde investir.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={14} />
          Nova categoria
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-muted-foreground text-sm text-center max-w-64">
            Crie categorias para organizar ativos que você está avaliando, ex: "FIIs de Shopping", "Elétricas".
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <WatchlistGroupCard
              key={group.id}
              group={group}
              assets={assets.filter((a) => a.groupId === group.id)}
              onEditGroup={(name, description) => editGroup(group.id, { name, description })}
              onDeleteGroup={() => removeGroup(group.id)}
              onAddAsset={(ticker, name, type) => addAsset(group.id, ticker, name, type)}
              onUpdateGroupFields={(fields) => updateGroupFields(group.id, fields)}
              onSetFieldValue={setFieldValue}
              onSetVerdict={setVerdict}
              onDeleteAsset={removeAsset}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nome</p>
              <input
                className={inputClass}
                placeholder="FIIs de Shopping, Elétricas..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Descrição (opcional)</p>
              <input
                className={inputClass}
                placeholder="Ex: comparando FIIs com ABL > 50k m²"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Criar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
