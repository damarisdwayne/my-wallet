import { Pencil, Trash2 } from 'lucide-react'

export const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    aria-label="Editar movimentação"
  >
    <Pencil size={12} />
  </button>
)

interface DeleteControlProps {
  tradeId: string
  confirmDeleteId: string | null
  onDelete: (id: string) => void
  onConfirm: (id: string) => void
  onCancel: () => void
}

export const DeleteControl = ({
  tradeId,
  confirmDeleteId,
  onDelete,
  onConfirm,
  onCancel,
}: DeleteControlProps) =>
  confirmDeleteId === tradeId ? (
    <div className="flex items-center justify-end gap-1">
      <span className="text-xs text-destructive">Confirmar?</span>
      <button
        onClick={() => onDelete(tradeId)}
        className="px-1.5 py-0.5 rounded text-xs bg-destructive text-destructive-foreground"
      >
        Sim
      </button>
      <button
        onClick={onCancel}
        className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
      >
        Não
      </button>
    </div>
  ) : (
    <button
      onClick={() => onConfirm(tradeId)}
      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
    >
      <Trash2 size={12} />
    </button>
  )
