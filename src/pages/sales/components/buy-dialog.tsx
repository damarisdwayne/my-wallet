import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { emptyBuyForm } from '../utils'
import { BuyFormFields } from './buy-form-fields'

interface BuyDialogProps {
  open: boolean
  title: string
  description: string
  submitLabel: string
  form: typeof emptyBuyForm
  onChange: (f: typeof emptyBuyForm) => void
  onClose: () => void
  onSubmit: () => void
}

export const BuyDialog = ({
  open,
  title,
  description,
  submitLabel,
  form,
  onChange,
  onClose,
  onSubmit,
}: BuyDialogProps) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <BuyFormFields prefix="buy" form={form} onChange={onChange} />
      <DialogFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          {submitLabel}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
