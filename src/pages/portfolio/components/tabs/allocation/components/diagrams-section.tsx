import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { inputClass } from '../constants'
import type { Diagram, PortfolioCategory } from '@/types'
import { EditQuestionsDialog } from './edit-questions-dialog'

interface DiagramsSheetProps {
  open: boolean
  diagrams: Diagram[]
  categories: PortfolioCategory[]
  saveDiagram: (d: Diagram) => Promise<void>
  deleteDiagram: (id: string) => Promise<void>
  onClose: () => void
}

export const DiagramsSheet = ({
  open,
  diagrams,
  categories,
  saveDiagram,
  deleteDiagram,
  onClose,
}: DiagramsSheetProps) => {
  const [editQDiagram, setEditQDiagram] = useState<Diagram | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [linkingId, setLinkingId] = useState<string | null>(null)

  const catName = (catId: string) => categories.find((c) => c.id === catId)?.name ?? '—'

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    await saveDiagram({ id: `diag-${Date.now()}`, name, categoryId: '', questions: [] })
    setNewName('')
    setCreating(false)
  }

  const handleLinkCategory = async (diagram: Diagram, catId: string) => {
    await saveDiagram({ ...diagram, categoryId: catId })
    setLinkingId(null)
  }

  const handleDelete = async (id: string) => {
    await deleteDiagram(id)
    setConfirmDeleteId(null)
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose()
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <SheetTitle>Diagramas</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {diagrams.length === 0 && (
              <p className="px-6 py-6 text-sm text-muted-foreground">
                Nenhum diagrama criado ainda.
              </p>
            )}

            {diagrams.map((d) => (
              <div key={d.id} className="px-6 py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {d.questions.length} pergunta{d.questions.length === 1 ? '' : 's'}
                      {d.categoryId && (
                        <>
                          {' '}
                          · <span className="text-foreground">{catName(d.categoryId)}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditQDiagram(d)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={11} />
                      Perguntas
                    </button>
                    {confirmDeleteId === d.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-destructive">Confirmar?</span>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="px-1.5 py-1 rounded text-xs bg-destructive text-destructive-foreground"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-1 rounded text-xs bg-muted text-muted-foreground"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(d.id)}
                        className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category link */}
                {linkingId === d.id ? (
                  <select
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    defaultValue={d.categoryId}
                    onChange={(e) => handleLinkCategory(d, e.target.value)}
                    autoFocus
                    onBlur={() => setLinkingId(null)}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setLinkingId(d.id)}
                    className="text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {d.categoryId ? 'Trocar categoria' : 'Vincular categoria'}
                  </button>
                )}
              </div>
            ))}

            {/* Create new */}
            <div className="px-6 py-4">
              {creating ? (
                <div className="flex gap-2 items-center">
                  <input
                    className={inputClass}
                    placeholder="Nome do diagrama"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate()
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className="px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0"
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => {
                      setCreating(false)
                      setNewName('')
                    }}
                    className="px-3 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={14} />
                  Novo diagrama
                </button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {editQDiagram && (
        <EditQuestionsDialog
          open
          diagram={editQDiagram}
          onOpenChange={(v) => {
            if (!v) setEditQDiagram(null)
          }}
          onSaveDiagram={async (d) => {
            await saveDiagram(d)
            setEditQDiagram(d)
          }}
        />
      )}
    </>
  )
}
