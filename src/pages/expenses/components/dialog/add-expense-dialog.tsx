import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components'
import type { ExpenseCategory } from '@/types'
import { INPUT_CLASS } from '../../constants'
import { categoryLabel, emptyForm } from '../../utils'

type Props = {
  onAdd: (expense: {
    description: string
    amount: number
    category: ExpenseCategory
    date: string
    source: 'manual'
  }) => Promise<void>
}

export const AddExpenseDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const handle = async () => {
    const amount = Number.parseFloat(form.amount.replace(',', '.'))
    if (!form.description.trim() || Number.isNaN(amount) || amount <= 0) return
    await onAdd({
      description: form.description.trim(),
      amount,
      category: form.category,
      date: form.date,
      source: 'manual',
    })
    setForm(emptyForm)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
          <PlusCircle size={15} />
          Adicionar
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar gasto</DialogTitle>
          <DialogDescription>Registre um novo gasto manualmente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="desc" className="text-sm font-medium text-foreground">
              Descrição
            </label>
            <input
              id="desc"
              className={INPUT_CLASS}
              placeholder="Ex: Mercado"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-sm font-medium text-foreground">
              Valor (R$)
            </label>
            <input
              id="amount"
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
            <label htmlFor="category" className="text-sm font-medium text-foreground">
              Categoria
            </label>
            <select
              id="category"
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
          <div className="space-y-1.5">
            <label htmlFor="date" className="text-sm font-medium text-foreground">
              Data
            </label>
            <input
              id="date"
              type="date"
              className={INPUT_CLASS}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
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
