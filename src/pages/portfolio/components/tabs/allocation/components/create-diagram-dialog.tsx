import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { inputClass } from '../constants'

interface CreateDiagramDialogProps {
  open: boolean
  value: string
  onChange: (v: string) => void
  onClose: () => void
  onSubmit: () => void
}

export const CreateDiagramDialog = ({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
}: CreateDiagramDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(v) => {
      if (!v) onClose()
    }}
  >
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Criar diagrama</DialogTitle>
        <DialogDescription>
          Dê um nome ao diagrama para a categoria selecionada.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-2">
        <input
          className={inputClass}
          placeholder="Nome do diagrama"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          autoFocus
        />
      </div>
      <DialogFooter className="mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Criar
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
