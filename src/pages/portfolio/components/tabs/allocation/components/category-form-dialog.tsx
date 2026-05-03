import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Diagram } from '@/types'
import { emptyForm } from '../constants'
import { CatFormFields } from './cat-form-fields'

interface CategoryFormDialogProps {
  open: boolean
  title: string
  description: string
  submitLabel: string
  disabled?: boolean
  form: ReturnType<typeof emptyForm>
  diagrams: Diagram[]
  onSet: (k: string, v: string | import('@/types').AssetType[]) => void
  onClose: () => void
  onSubmit: () => void
}

export const CategoryFormDialog = ({
  open,
  title,
  description,
  submitLabel,
  disabled,
  form,
  diagrams,
  onSet,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(v) => {
      if (!v) onClose()
    }}
  >
    <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <CatFormFields form={form} set={onSet} prefix={title} diagrams={diagrams} />
      <DialogFooter className="mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
