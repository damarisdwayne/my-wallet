import type { SaleCategory } from '@/types'

export const saleCategories: Record<SaleCategory, string> = {
  gpu: 'GPU',
  cpu: 'CPU',
  ram: 'RAM',
  ssd: 'SSD',
  hdd: 'HDD',
  notebook: 'Notebook',
  smartphone: 'Smartphone',
  console: 'Console',
  periferico: 'Periférico',
  outro: 'Outro',
}

const MONTH_LABELS: Record<string, string> = {
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
export const todayStr = new Date().toISOString().slice(0, 10)

export const emptyBuyForm = {
  name: '',
  category: 'outro' as SaleCategory,
  buyPrice: '',
  boughtAt: todayStr,
  notes: '',
}

export const emptySellForm = {
  sellPrice: '',
  soldAt: todayStr,
}
