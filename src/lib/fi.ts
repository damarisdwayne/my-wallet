import type { Asset } from '@/types'

const RATE_LABEL: Record<string, string> = {
  prefixado: 'Pré',
  pos_cdi: 'Pós CDI',
  ipca_plus: 'IPCA+',
  igpm_plus: 'IGP-M+',
  pos_selic: 'Pós SELIC',
}

export const getFiLabel = (a: Asset): string => {
  if (!a.fixedIncomeType) return a.name
  const parts: string[] = [a.fixedIncomeType]
  if (a.rateType && RATE_LABEL[a.rateType]) parts.push(RATE_LABEL[a.rateType])
  const rate = a.rateType === 'prefixado' ? a.prefixedRate : a.indexerRate
  if (rate != null) parts.push(`${rate}%`)
  const emitter = a.issuer || a.institution
  if (emitter) parts.push(emitter)
  return parts.join(' ')
}
