import type { ExpenseCategory } from '@/types'

export const categoryLabel: Record<ExpenseCategory, string> = {
  housing: 'Moradia',
  food: 'Alimentação',
  transport: 'Transporte',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  clothing: 'Vestuário',
  subscriptions: 'Assinaturas',
  investments: 'Investimentos',
  other: 'Outros',
}

export const categoryColors: Record<
  ExpenseCategory,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  housing: 'destructive',
  food: 'warning',
  transport: 'default',
  health: 'success',
  education: 'default',
  entertainment: 'secondary',
  clothing: 'secondary',
  subscriptions: 'warning',
  investments: 'success',
  other: 'secondary',
}

export const emptyForm = {
  description: '',
  amount: '',
  category: 'food' as ExpenseCategory,
  date: new Date().toISOString().slice(0, 10),
}

export const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez',
}

export const formatMonthLabel = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${MONTH_LABELS[m]}/${y.slice(2)}`
}

export const todayMonth = new Date().toISOString().slice(0, 7)

export const monthDiff = (from: string, to: string): number => {
  const [fy, fm] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  return (ty - fy) * 12 + (tm - fm)
}

export const addMonthStr = (month: string, n: number): string => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
