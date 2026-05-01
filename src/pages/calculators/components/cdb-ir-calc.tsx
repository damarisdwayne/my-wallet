import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalcActions,
  CurrencyInput,
  PeriodInput,
  PercentInput,
  fmtBRL,
  getIrRate,
  toDays,
  type PeriodUnit,
} from './shared'

type RateType = 'prefixado' | 'cdi' | 'ipca'

const RATE_TYPE_OPTIONS: {
  value: RateType
  label: string
  placeholder: string
  refLabel: string
}[] = [
  { value: 'prefixado', label: 'Pré', placeholder: 'ex: 13', refLabel: '' },
  { value: 'cdi', label: 'CDI', placeholder: 'ex: 110', refLabel: 'CDI de referência (% a.a.)' },
  { value: 'ipca', label: 'IPCA', placeholder: 'ex: 6', refLabel: 'IPCA de referência (% a.a.)' },
]

type Results = {
  grossReturn: number
  irAmount: number
  netReturn: number
  finalAmount: number
  grossRatePeriod: number
  netRatePeriod: number
  effectiveNetAnnual: number
  irLabel: string
  irRate: number
  rateDescription: string
  capital: number
}

export const CdbIrCalc = () => {
  const [rateType, setRateType] = useState<RateType>('prefixado')
  const [capital, setCapital] = useState('')
  const [rate, setRate] = useState('')
  const [referenceRate, setReferenceRate] = useState('')
  const [period, setPeriod] = useState('')
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('meses')
  const [results, setResults] = useState<Results | null>(null)

  const currentType = RATE_TYPE_OPTIONS.find((t) => t.value === rateType) ?? RATE_TYPE_OPTIONS[0]
  const needsRef = rateType === 'cdi' || rateType === 'ipca'

  const clear = () => {
    setCapital('')
    setRate('')
    setReferenceRate('')
    setPeriod('')
    setResults(null)
  }

  const calcular = () => {
    const C = Number(capital)
    const r = Number(rate)
    const p = Number(period)
    const ref = Number(referenceRate)
    if (C <= 0 || r <= 0 || p <= 0) return
    if (needsRef && ref <= 0) return

    const days = toDays(p, periodUnit)

    let effectiveAnnualRate: number
    let rateDescription: string

    if (rateType === 'cdi') {
      effectiveAnnualRate = (ref * r) / 10000
      rateDescription = `${r.toFixed(2)}% do CDI (CDI: ${ref.toFixed(2)}% a.a.) = ${(effectiveAnnualRate * 100).toFixed(2)}% a.a.`
    } else if (rateType === 'ipca') {
      effectiveAnnualRate = (1 + ref / 100) * (1 + r / 100) - 1
      rateDescription = `IPCA (${ref.toFixed(2)}%) + ${r.toFixed(2)}% = ${(effectiveAnnualRate * 100).toFixed(2)}% a.a.`
    } else {
      effectiveAnnualRate = r / 100
      rateDescription = `${r.toFixed(2)}% a.a.`
    }

    const irInfo = getIrRate(days)
    const grossReturn = C * (Math.pow(1 + effectiveAnnualRate, days / 365) - 1)
    const irAmount = grossReturn * irInfo.rate
    const netReturn = grossReturn - irAmount

    setResults({
      grossReturn,
      irAmount,
      netReturn,
      finalAmount: C + netReturn,
      grossRatePeriod: (Math.pow(1 + effectiveAnnualRate, days / 365) - 1) * 100,
      netRatePeriod: (netReturn / C) * 100,
      effectiveNetAnnual: (Math.pow(1 + netReturn / C, 365 / days) - 1) * 100,
      irLabel: irInfo.label,
      irRate: irInfo.rate,
      rateDescription,
      capital: C,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Rendimento líquido do CDB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Always 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              id="cdb-capital"
              label="Capital inicial"
              value={capital}
              onChange={(v) => {
                setCapital(v)
                setResults(null)
              }}
              placeholder="10000"
            />
            <PercentInput
              id="cdb-rate"
              label="Taxa do CDB"
              value={rate}
              onChange={(v) => {
                setRate(v)
                setResults(null)
              }}
              placeholder={currentType.placeholder}
              showPrefix={false}
              selectValue={rateType}
              selectOptions={RATE_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
              onSelectChange={(v) => {
                setRateType(v as RateType)
                setRate('')
                setReferenceRate('')
                setResults(null)
              }}
            />
            {needsRef && (
              <PercentInput
                id="cdb-ref-rate"
                label={currentType.refLabel}
                value={referenceRate}
                onChange={(v) => {
                  setReferenceRate(v)
                  setResults(null)
                }}
                placeholder="ex: 13.65"
              />
            )}
            <PeriodInput
              id="cdb-period"
              label="Prazo"
              value={period}
              onChange={(v) => {
                setPeriod(v)
                setResults(null)
              }}
              unit={periodUnit}
              onUnitChange={(u) => {
                setPeriodUnit(u)
                setResults(null)
              }}
            />
          </div>

          <CalcActions onCalc={calcular} onClear={clear} />
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendimento bruto</CardTitle>
                <p className="text-2xl font-bold text-foreground">{fmtBRL(results.grossReturn)}</p>
                <p className="text-xs text-muted-foreground">
                  {results.grossRatePeriod.toFixed(2)}% no período
                </p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>IR a recolher</CardTitle>
                <p className="text-2xl font-bold text-destructive">{fmtBRL(results.irAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {(results.irRate * 100).toFixed(2)}% — {results.irLabel}
                </p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rendimento líquido</CardTitle>
                <p className="text-2xl font-bold text-success">{fmtBRL(results.netReturn)}</p>
                <p className="text-xs text-muted-foreground">
                  {results.netRatePeriod.toFixed(2)}% no período
                </p>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              {[
                { label: 'Taxa efetiva utilizada', value: results.rateDescription },
                { label: 'Capital investido', value: fmtBRL(results.capital) },
                { label: 'Rendimento bruto', value: fmtBRL(results.grossReturn) },
                {
                  label: `IR (${(results.irRate * 100).toFixed(2)}% — ${results.irLabel})`,
                  value: `- ${fmtBRL(results.irAmount)}`,
                  color: 'text-destructive',
                },
                {
                  label: 'Rendimento líquido',
                  value: fmtBRL(results.netReturn),
                  color: 'text-success',
                },
                { label: 'Valor final líquido', value: fmtBRL(results.finalAmount) },
                {
                  label: 'Taxa líquida efetiva (a.a.)',
                  value: `${results.effectiveNetAnnual.toFixed(2)}% a.a.`,
                  color: 'text-success',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <p className="text-sm text-foreground">{row.label}</p>
                  <p className={`text-sm font-semibold ${row.color ?? 'text-foreground'}`}>
                    {row.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
