import type { BondType } from './types'

export const BOND_OPTIONS: { value: BondType; label: string }[] = [
  { value: 'prefixado', label: 'Prefixado' },
  { value: 'ipca', label: 'IPCA+' },
]
