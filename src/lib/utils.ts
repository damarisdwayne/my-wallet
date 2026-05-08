import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/** Returns the dividend amount in BRL. Prefers amountBrl (fixed at payment date PTAX) when available. */
export const getDividendBrl = (
  d: {
    amount: number
    currency?: 'USD'
    amountUsd?: number
    amountBrl?: number
    usdRateAtPayment?: number
  },
  usdRate: number,
) => {
  if (d.currency !== 'USD') return d.amount
  if (d.amountBrl != null && d.amountBrl > 0) return d.amountBrl
  if (d.usdRateAtPayment != null && d.amountUsd != null) return d.amountUsd * d.usdRateAtPayment
  return (d.amountUsd ?? 0) * usdRate
}

/** Returns the IR amount in BRL for a dividend. Prefers irBrl (fixed at payment date PTAX) when available. */
export const getDividendIrBrl = (
  d: { ir?: number; currency?: 'USD'; irUsd?: number; irBrl?: number; usdRateAtPayment?: number },
  usdRate: number,
) => {
  if (d.currency !== 'USD') return d.ir ?? 0
  if (d.irBrl != null && d.irBrl > 0) return d.irBrl
  if (d.usdRateAtPayment != null && d.irUsd != null) return d.irUsd * d.usdRateAtPayment
  return (d.irUsd ?? 0) * usdRate
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatDateShort = (iso: string): string =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

export const formatQuantity = (v: number): string =>
  v % 1 === 0 ? String(Math.round(v)) : v.toFixed(2)

export const formatNumber = (v: number, decimals = 2): string =>
  v.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export const formatUSD = (v: number): string =>
  `$ ${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const formatCompact = (v: number): string => {
  if (Math.abs(v) >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`
  return formatCurrency(v)
}

const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export const formatMonthYear = (ym: string): string => {
  const [y, m] = ym.split('-')
  return `${MONTH_ABBR[Number(m) - 1]}/${y.slice(2)}`
}
