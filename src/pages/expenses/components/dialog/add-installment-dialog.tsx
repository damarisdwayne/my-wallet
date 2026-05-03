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
import type { ExpenseCategory, InstallmentExpense } from '@/types'
import { INPUT_CLASS, emptyInstallment } from '../../constants'
import { categoryLabel } from '../../utils'
import { formatCurrency } from '@/lib/utils'

type Props = {
  onAdd: (item: Omit<InstallmentExpense, 'id'>) => Promise<void>
}

export const AddInstallmentDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyInstallment)

  const handle = async () => {
    const total = Number.parseFloat(form.totalAmount.replace(',', '.'))
    const n = Number.parseInt(form.installments, 10)
    if (!form.description.trim() || Number.isNaN(total) || total <= 0 || !n || n < 2) return
    await onAdd({
      description: form.description.trim(),
      totalAmount: total,
      installments: n,
      installmentAmount: Math.round((total / n) * 100) / 100,
      startMonth: form.startMonth,
      category: form.category,
      createdAt: new Date().toISOString(),
    })
    setForm(emptyInstallment)
    setOpen(false)
  }

  const installmentPreview =
    form.totalAmount && form.installments
      ? Math.round(
          (Number.parseFloat(form.totalAmount.replace(',', '.')) /
            Number.parseInt(form.installments, 10)) *
            100,
        ) / 100
      : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors">
          <PlusCircle size={15} />
          Parcelado
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar gasto parcelado</DialogTitle>
          <DialogDescription>O valor será dividido pelo número de parcelas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <input
              className={INPUT_CLASS}
              placeholder="Ex: TV Samsung 65'"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Valor total (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={INPUT_CLASS}
                placeholder="0,00"
                value={form.totalAmount}
                onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nº parcelas</label>
              <input
                type="number"
                min="2"
                step="1"
                className={INPUT_CLASS}
                placeholder="12"
                value={form.installments}
                onChange={(e) => setForm((f) => ({ ...f, installments: e.target.value }))}
              />
            </div>
          </div>
          {installmentPreview !== null && !Number.isNaN(installmentPreview) && (
            <p className="text-sm text-muted-foreground">
              Parcela:{' '}
              <span className="font-medium text-foreground">
                {formatCurrency(installmentPreview)}
              </span>
              /mês
            </p>
          )}
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
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Mês inicial</label>
            <input
              type="month"
              className={INPUT_CLASS}
              value={form.startMonth}
              onChange={(e) => setForm((f) => ({ ...f, startMonth: e.target.value }))}
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
