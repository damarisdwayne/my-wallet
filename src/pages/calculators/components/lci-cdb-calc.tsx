import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalcActions,
  IR_RATES,
  PeriodInput,
  PercentInput,
  getIrRate,
  toDays,
  type PeriodUnit,
} from './shared'

type RateType = 'prefixado' | 'cdi' | 'ipca'

const RATE_TYPE_OPTIONS: { value: RateType; label: string; placeholder: string }[] = [
  { value: 'prefixado', label: 'Pré', placeholder: 'ex: 10' },
  { value: 'cdi', label: 'CDI', placeholder: 'ex: 92' },
  { value: 'ipca', label: 'IPCA', placeholder: 'ex: 6' },
]

const rateSuffix: Record<RateType, string> = {
  prefixado: '% a.a.',
  cdi: '% CDI',
  ipca: '% a.a.',
}

type Results = {
  lciRate: number
  lciSuffix: string
  irInfo: (typeof IR_RATES)[0]
  cdbEquivalent: number
}

export const LciCdbCalc = () => {
  const [rateType, setRateType] = useState<RateType>('prefixado')
  const [lciRate, setLciRate] = useState('')
  const [period, setPeriod] = useState('')
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('meses')
  const [results, setResults] = useState<Results | null>(null)

  const currentTypeOpt = RATE_TYPE_OPTIONS.find((t) => t.value === rateType) ?? RATE_TYPE_OPTIONS[0]

  const clear = () => { setLciRate(''); setPeriod(''); setResults(null) }

  const calcular = () => {
    const lci = Number(lciRate)
    const p = Number(period) || 12
    if (lci <= 0) return
    const irInfo = getIrRate(toDays(p, periodUnit))
    setResults({ lciRate: lci, lciSuffix: rateSuffix[rateType], irInfo, cdbEquivalent: lci / (1 - irInfo.rate) })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Equivalência LCI / LCA → CDB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PercentInput
              id="lci-rate"
              label="Taxa da LCI / LCA"
              value={lciRate}
              onChange={(v) => { setLciRate(v); setResults(null) }}
              placeholder={currentTypeOpt.placeholder}
              showPrefix={false}
              selectValue={rateType}
              selectOptions={RATE_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
              onSelectChange={(v) => { setRateType(v as RateType); setResults(null) }}
            />
            <PeriodInput
              id="lci-period"
              label="Prazo"
              value={period}
              onChange={(v) => { setPeriod(v); setResults(null) }}
              unit={periodUnit}
              onUnitChange={(u) => { setPeriodUnit(u); setResults(null) }}
            />
          </div>

          <CalcActions onCalc={calcular} onClear={clear} />
        </CardContent>
      </Card>

      {results && (
        <>
          <Card className="border-primary/40">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-2">
              <p className="text-sm text-muted-foreground">
                Uma LCI de{' '}
                <strong className="text-foreground">
                  {results.lciRate.toFixed(2)} {results.lciSuffix}
                </strong>{' '}
                equivale a um CDB bruto de
              </p>
              <p className="text-5xl font-bold text-primary">
                {results.cdbEquivalent.toFixed(2)}
                <span className="text-2xl ml-1">{results.lciSuffix}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                considerando IR de {(results.irInfo.rate * 100).toFixed(2)}% ({results.irInfo.label})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equivalência por prazo</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Prazo</th>
                    <th className="text-right py-2 pr-4 font-medium text-muted-foreground">IR</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">CDB bruto equivalente</th>
                  </tr>
                </thead>
                <tbody>
                  {IR_RATES.map((row) => {
                    const equiv = results.lciRate / (1 - row.rate)
                    const isActive = results.irInfo.label === row.label
                    return (
                      <tr
                        key={row.label}
                        className={`border-b border-border/50 ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`}
                      >
                        <td className="py-2.5 pr-4">
                          {row.label}
                          {isActive && (
                            <span className="ml-2 text-xs font-normal bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              seu prazo
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-right">{(row.rate * 100).toFixed(2)}%</td>
                        <td className="py-2.5 text-right">{equiv.toFixed(2)} {results.lciSuffix}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
