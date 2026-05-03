import type { ReactNode } from 'react'
import type { FixedIncomeType, RateType } from '@/types'
import { RATE_LABEL, TESOURO_RATE_TYPE } from './constants'

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
)

export const buildFiName = (f: {
  fixedIncomeType: FixedIncomeType
  rateType: RateType
  indexerRate: string
  prefixedRate: string
  issuer: string
  institution: string
  maturityDate: string
}): string => {
  const parts: string[] = [f.fixedIncomeType, RATE_LABEL[f.rateType]]
  const rate = f.rateType === 'prefixado' ? f.prefixedRate : f.indexerRate
  if (rate) parts.push(`${rate}%`)
  const emitter = f.issuer || f.institution
  if (emitter) parts.push(emitter)
  return parts.join(' ')
}

export const isTesourotType = (t: FixedIncomeType) => t in TESOURO_RATE_TYPE
