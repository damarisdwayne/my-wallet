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

/** Returns the dividend amount in BRL. USD dividends use amountUsd × current rate. */
export const getDividendBrl = (
  d: { amount: number; currency?: 'USD'; amountUsd?: number },
  usdRate: number,
) => (d.currency === 'USD' ? (d.amountUsd ?? 0) * usdRate : d.amount)

/** Returns the IR amount in BRL for a dividend. */
export const getDividendIrBrl = (
  d: { ir?: number; currency?: 'USD'; irUsd?: number },
  usdRate: number,
) => (d.currency === 'USD' ? (d.irUsd ?? 0) * usdRate : (d.ir ?? 0))

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}
