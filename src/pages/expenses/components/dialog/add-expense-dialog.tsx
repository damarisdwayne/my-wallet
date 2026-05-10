import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components'
import type { ExpenseCategory, FixedExpense, InstallmentExpense } from '@/types'
import { INPUT_CLASS, emptyFixed, emptyInstallment } from '../../constants'
import { formatCurrency } from '@/lib/utils'
import { categoryLabel, emptyForm } from '../../utils'

type ExpenseType = 'normal' | 'fixo' | 'parcelado'

const TYPE_TABS: { value: ExpenseType; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'fixo', label: 'Fixo' },
  { value: 'parcelado', label: 'Parcelado' },
]

type Props = {
  onAdd: (expense: {
    description: string
    amount: number
    category: ExpenseCategory
    date: string
    source: 'manual'
  }) => Promise<void>
  onAddFixed: (item: Omit<FixedExpense, 'id'>) => Promise<void>
  onAddInstallment: (item: Omit<InstallmentExpense, 'id'>) => Promise<void>
}

export const AddExpenseDialog = ({ onAdd, onAddFixed, onAddInstallment }: Props) => {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ExpenseType>('normal')
  const [form, setForm] = useState(emptyForm)
  const [fixed, setFixed] = useState(emptyFixed)
  const [installment, setInstallment] = useState(emptyInstallment)

  const reset = () => {
    setType('normal')
    setForm(emptyForm)
    setFixed(emptyFixed)
    setInstallment(emptyInstallment)
  }

  const handleClose = (v: boolean) => {
    if (!v) reset()
    setOpen(v)
  }

  const handle = async () => {
    if (type === 'normal') {
      const amount = Number.parseFloat(form.amount.replace(',', '.'))
      if (!form.description.trim() || Number.isNaN(amount) || amount <= 0) return
      await onAdd({
        description: form.description.trim(),
        amount,
        category: form.category,
        date: form.date,
        source: 'manual',
      })
    } else if (type === 'fixo') {
      const amount = Number.parseFloat(fixed.amount.replace(',', '.'))
      if (!fixed.description.trim() || Number.isNaN(amount) || amount <= 0) return
      const item: Omit<FixedExpense, 'id'> = {
        description: fixed.description.trim(),
        amount,
        category: fixed.category,
        startMonth: fixed.startMonth,
        createdAt: new Date().toISOString(),
      }
      if (fixed.endMonth) item.endMonth = fixed.endMonth
      await onAddFixed(item)
    } else {
      const total = Number.parseFloat(installment.totalAmount.replace(',', '.'))
      const n = Number.parseInt(installment.installments, 10)
      if (!installment.description.trim() || Number.isNaN(total) || total <= 0 || !n || n < 2)
        return
      await onAddInstallment({
        description: installment.description.trim(),
        totalAmount: total,
        installments: n,
        installmentAmount: Math.round((total / n) * 100) / 100,
        startMonth: installment.startMonth,
        category: installment.category,
        createdAt: new Date().toISOString(),
      })
    }
    reset()
    setOpen(false)
  }

  const installmentPreview =
    installment.totalAmount && installment.installments
      ? Math.round(
          (Number.parseFloat(installment.totalAmount.replace(',', '.')) /
            Number.parseInt(installment.installments, 10)) *
            100,
        ) / 100
      : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
          <PlusCircle size={15} />
          Adicionar
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar gasto</DialogTitle>
        </DialogHeader>

        {/* Type selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {TYPE_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                type === t.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Normal */}
        {type === 'normal' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Gasto pontual registrado manualmente.</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <input
                className={INPUT_CLASS}
                placeholder="Ex: Mercado"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Valor (R$)</label>
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
                {Object.entries(categoryLabel).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Data</label>
              <input
                type="date"
                className={INPUT_CLASS}
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Fixo */}
        {type === 'fixo' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Aparece automaticamente todo mês até ser removido.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <input
                className={INPUT_CLASS}
                placeholder="Ex: Condomínio"
                value={fixed.description}
                onChange={(e) => setFixed((f) => ({ ...f, description: e.target.value }))}
                autoFocus
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
                value={fixed.amount}
                onChange={(e) => setFixed((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Categoria</label>
              <select
                className={INPUT_CLASS}
                value={fixed.category}
                onChange={(e) =>
                  setFixed((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
                }
              >
                {Object.entries(categoryLabel).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
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
                  value={fixed.startMonth}
                  onChange={(e) => setFixed((f) => ({ ...f, startMonth: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Fim (opcional)</label>
                <input
                  type="month"
                  className={INPUT_CLASS}
                  value={fixed.endMonth}
                  onChange={(e) => setFixed((f) => ({ ...f, endMonth: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Parcelado */}
        {type === 'parcelado' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              O valor total é dividido pelo número de parcelas.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <input
                className={INPUT_CLASS}
                placeholder="Ex: TV Samsung 65'"
                value={installment.description}
                onChange={(e) => setInstallment((f) => ({ ...f, description: e.target.value }))}
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
                  value={installment.totalAmount}
                  onChange={(e) => setInstallment((f) => ({ ...f, totalAmount: e.target.value }))}
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
                  value={installment.installments}
                  onChange={(e) => setInstallment((f) => ({ ...f, installments: e.target.value }))}
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
                value={installment.category}
                onChange={(e) =>
                  setInstallment((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
                }
              >
                {Object.entries(categoryLabel).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mês inicial</label>
              <input
                type="month"
                className={INPUT_CLASS}
                value={installment.startMonth}
                onChange={(e) => setInstallment((f) => ({ ...f, startMonth: e.target.value }))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <button
            onClick={() => handleClose(false)}
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
