export type BondType = 'prefixado' | 'ipca'

export type Results = {
  daysElapsed: number
  daysRemaining: number
  daysTotal: number
  currentValue: number
  valueAtMaturity: number
  grossGainSell: number
  irAmountSell: number
  netGainSell: number
  netValueSell: number
  grossGainHold: number
  irAmountHold: number
  netGainHold: number
  netValueHold: number
  annualizedSell: number
  annualizedHold: number
  irLabelSell: string
  irLabelHold: string
  irRateSell: number
  irRateHold: number
  buyRate: number
  currentRate: number
}
