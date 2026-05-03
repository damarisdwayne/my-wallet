import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { inputClass } from '../constants'
import type { Diagram, PortfolioCategory } from '@/types'
import { EditQuestionsDialog } from './edit-questions-dialog'

interface DiagramsSectionProps {
  diagrams: Diagram[]
  categories: PortfolioCategory[]
  saveDiagram: (d: Diagram) => Promise<void>
  deleteDiagram: (id: string) => Promise<void>
}

export const DiagramsSection = ({
  diagrams,
  categories,
  saveDiagram,
  deleteDiagram,
}: DiagramsSectionProps) => {
  const [open, setOpen] = useState(false)
  const [editQDiagram, setEditQDiagram] = useState<Diagram | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [linkingId, setLinkingId] = useState<string | null>(null)

  const catName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name ?? '—'

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
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Diagramas
          <span className="text-xs text-muted-foreground font-normal">
            ({diagrams.length})
          </span>
        </span>
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {diagrams.length === 0 && (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              Nenhum diagrama criado ainda.
            </p>
          )}

          {diagrams.map((d) => (
            <div key={d.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.questions.length} pergunta{d.questions.length !== 1 ? 's' : ''}
                  {d.categoryId && (
                    <> · Categoria: <span className="text-foreground">{catName(d.categoryId)}</span></>
                  )}
                </p>
              </div>

              {/* Category link selector */}
              {linkingId === d.id ? (
                <select
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {d.categoryId ? 'Trocar categoria' : 'Vincular categoria'}
                </button>
              )}

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
                    className="px-1.5 py-0.5 rounded text-xs bg-destructive text-destructive-foreground"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
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
          ))}

          {/* Create new diagram */}
          <div className="px-4 py-3">
            {creating ? (
              <div className="flex gap-2 items-center">
                <input
                  className={inputClass}
                  placeholder="Nome do diagrama"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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
                  onClick={() => { setCreating(false); setNewName('') }}
                  className="px-3 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={13} />
                Novo diagrama
              </button>
            )}
          </div>
        </div>
      )}

      {editQDiagram && (
        <EditQuestionsDialog
          open
          diagram={editQDiagram}
          onOpenChange={(v) => { if (!v) setEditQDiagram(null) }}
          onSaveDiagram={async (d) => {
            await saveDiagram(d)
            setEditQDiagram(d)
          }}
        />
      )}
    </div>
  )
}
