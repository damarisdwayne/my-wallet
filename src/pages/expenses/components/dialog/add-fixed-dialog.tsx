import { useState } from 'react'
import { Repeat2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components'
import type { ExpenseCategory, FixedExpense } from '@/types'
import { INPUT_CLASS, emptyFixed } from '../../constants'
import { categoryLabel } from '../../utils'

type Props = {
  onAdd: (item: Omit<FixedExpense, 'id'>) => Promise<void>
}

export const AddFixedDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyFixed)

  const handle = async () => {
    const amount = Number.parseFloat(form.amount.replace(',', '.'))
    if (!form.description.trim() || Number.isNaN(amount) || amount <= 0) return
    const item: Omit<FixedExpense, 'id'> = {
      description: form.description.trim(),
      amount,
      category: form.category,
      startMonth: form.startMonth,
      createdAt: new Date().toISOString(),
    }
    if (form.endMonth) item.endMonth = form.endMonth
    await onAdd(item)
    setForm(emptyFixed)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors">
          <Repeat2 size={15} />
          Fixo
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar gasto fixo</DialogTitle>
          <DialogDescription>
            Aparecerá automaticamente em todos os meses até ser removido.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <input
              className={INPUT_CLASS}
              placeholder="Ex: Condomínio"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Valor mensal (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={INPUT_CLASS}
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <select
              className={INPUT_CLASS}
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
              }
            >
              {Object.entries(categoryLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Início (mês)</label>
              <input
                type="month"
                className={INPUT_CLASS}
                value={form.startMonth}
                onChange={(e) => setForm((f) => ({ ...f, startMonth: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Fim (opcional)</label>
              <input
                type="month"
                className={INPUT_CLASS}
                value={form.endMonth}
                onChange={(e) => setForm((f) => ({ ...f, endMonth: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handle}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            Adicionar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
