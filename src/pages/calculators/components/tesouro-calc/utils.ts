import type { BondType } from './types'

export const calDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000)

export const toBondType = (tipo: string): BondType | null => {
  const t = tipo.toLowerCase()
  if (t.includes('prefixado')) return 'prefixado'
  if (t.includes('ipca')) return 'ipca'
  return null
}
