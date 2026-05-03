import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ExpenseCategory, FixedExpense, InstallmentExpense } from '@/types'
import { formatMonthLabel } from '../utils'
import { AddExpenseDialog, AddFixedDialog, AddInstallmentDialog, OFXImportDialog } from './dialog'
import type { DisplayExpense } from '@/types'

type Props = {
  selectedMonth: string
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
  onImport: (expenses: Omit<DisplayExpense, 'id'>[]) => Promise<void>
  onAddFixed: (item: Omit<FixedExpense, 'id'>) => Promise<void>
  onAddInstallment: (item: Omit<InstallmentExpense, 'id'>) => Promise<void>
  onAddExpense: (expense: {
    description: string
    amount: number
    category: ExpenseCategory
    date: string
    source: 'manual'
  }) => Promise<void>
}

export const PageHeader = ({
  selectedMonth,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onImport,
  onAddFixed,
  onAddInstallment,
  onAddExpense,
}: Props) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h2 className="text-base font-semibold text-foreground">Gastos</h2>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground w-16 text-center">
          {formatMonthLabel(selectedMonth)}
        </span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <OFXImportDialog onImport={onImport} />
      <AddFixedDialog onAdd={onAddFixed} />
      <AddInstallmentDialog onAdd={onAddInstallment} />
      <AddExpenseDialog onAdd={onAddExpense} />
    </div>
  </div>
)
