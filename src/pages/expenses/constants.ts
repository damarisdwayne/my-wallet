import type { DisplayExpense, ExpenseCategory } from '@/types'
import { todayMonth } from './utils'

export const INPUT_CLASS =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export const SOURCE_LABEL: Record<DisplayExpense['source'], string> = {
  manual: 'manual',
  bank: 'banco',
  fixed: 'fixo',
  installment: 'parcela',
}

export const emptyFixed = {
  description: '',
  amount: '',
  category: 'housing' as ExpenseCategory,
  startMonth: todayMonth,
  endMonth: '',
}

export const emptyInstallment = {
  description: '',
  totalAmount: '',
  installments: '',
  category: 'housing' as ExpenseCategory,
  startMonth: todayMonth,
}
