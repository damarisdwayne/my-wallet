import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalcActions,
  CurrencyInput,
  PeriodInput,
  PercentInput,
  PERIOD_UNITS,
  fmtBRL,
  toMonths,
  type PeriodUnit,
} from './shared'

type RateFreq = 'mensal' | 'anual'

type RowEntry = { label: string; totalInvested: number; balance: number; earnings: number }

const buildMonthlyRows = (PV: number, PMT: number, rMonthly: number, n: number): RowEntry[] => {
  let balance = PV
  return Array.from({ length: n }, (_, i) => {
    balance = balance * (1 + rMonthly) + PMT
    const invested = PV + PMT * (i + 1)
    return {
      label: `${i + 1}º mês`,
      totalInvested: invested,
      balance,
      earnings: balance - invested,
    }
  })
}

const buildYearlyRows = (PV: number, PMT: number, rMonthly: number, n: number): RowEntry[] => {
  let balance = PV
  const totalYears = Math.ceil(n / 12)
  return Array.from({ length: totalYears }, (_, i) => {
    const monthsThisYear = i < totalYears - 1 ? 12 : n - i * 12
    for (let m = 0; m < monthsThisYear; m++) balance = balance * (1 + rMonthly) + PMT
    const yearMonths = Math.min((i + 1) * 12, n)
    const invested = PV + PMT * yearMonths
    return {
      label: `${i + 1}º ano`,
      totalInvested: invested,
      balance,
      earnings: balance - invested,
    }
  })
}

type Results = {
  finalAmount: number
  totalInvested: number
  totalEarnings: number
  earningsBarWidth: number
  rows: RowEntry[]
  showMonthly: boolean
  periodLabel: string
}

export const AposentadoriaCalc = () => {
  const [initialCapital, setInitialCapital] = useState('')
  const [monthlyContrib, setMonthlyContrib] = useState('')
  const [rate, setRate] = useState('')
  const [rateFreq, setRateFreq] = useState<RateFreq>('anual')
  const [period, setPeriod] = useState('')
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('anos')
  const [results, setResults] = useState<Results | null>(null)

  const reset = () => {
    setInitialCapital('')
    setMonthlyContrib('')
    setRate('')
    setPeriod('')
    setResults(null)
  }

  const calcular = () => {
    const PV = Number(initialCapital) || 0
    const PMT = Number(monthlyContrib) || 0
    const r = Number(rate)
    const p = Number(period)
    if (p <= 0 || r <= 0 || (PV <= 0 && PMT <= 0)) return

    const rAnnual = rateFreq === 'mensal' ? Math.pow(1 + r / 100, 12) - 1 : r / 100
    const totalMonths = Math.round(toMonths(p, periodUnit))
    const rMonthly = Math.pow(1 + rAnnual, 1 / 12) - 1

    const fv =
      PV * Math.pow(1 + rMonthly, totalMonths) +
      (rMonthly > 0
        ? PMT * ((Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly)
        : PMT * totalMonths)

    const invested = PV + PMT * totalMonths
    const earnings = fv - invested
    const showMonthly = totalMonths < 24
    const unitLabel = PERIOD_UNITS.find((u) => u.value === periodUnit)?.label ?? periodUnit

    setResults({
      finalAmount: fv,
      totalInvested: invested,
      totalEarnings: earnings,
      earningsBarWidth: Math.min((earnings / fv) * 100, 100),
      rows: showMonthly
        ? buildMonthlyRows(PV, PMT, rMonthly, totalMonths)
        : buildYearlyRows(PV, PMT, rMonthly, totalMonths),
      showMonthly,
      periodLabel: `${period} ${unitLabel}`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Simulador de Juros Compostos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              id="apo-initial"
              label="Valor inicial"
              value={initialCapital}
              onChange={setInitialCapital}
            />
            <CurrencyInput
              id="apo-monthly"
              label="Valor mensal"
              value={monthlyContrib}
              onChange={setMonthlyContrib}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PercentInput
              id="apo-rate"
              label="Taxa de juros"
              value={rate}
              onChange={setRate}
              placeholder="0"
              selectValue={rateFreq}
              selectOptions={[
                { value: 'mensal', label: 'mensal' },
                { value: 'anual', label: 'anual' },
              ]}
              onSelectChange={(v) => setRateFreq(v as RateFreq)}
            />
            <PeriodInput
              id="apo-period"
              label="Período"
              value={period}
              onChange={setPeriod}
              unit={periodUnit}
              onUnitChange={setPeriodUnit}
            />
          </div>

          <CalcActions onCalc={calcular} onClear={reset} />
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patrimônio final</CardTitle>
                <p className="text-2xl font-bold text-foreground">{fmtBRL(results.finalAmount)}</p>
                <p className="text-xs text-muted-foreground">após {results.periodLabel}</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total investido</CardTitle>
                <p className="text-2xl font-bold text-foreground">
                  {fmtBRL(results.totalInvested)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((results.totalInvested / results.finalAmount) * 100).toFixed(2)}% do patrimônio
                </p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rendimentos totais</CardTitle>
                <p className="text-2xl font-bold text-success">{fmtBRL(results.totalEarnings)}</p>
                <p className="text-xs text-muted-foreground">
                  {((results.totalEarnings / results.totalInvested) * 100).toFixed(2)}% sobre o
                  investido
                </p>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Composição do patrimônio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Capital: {(100 - results.earningsBarWidth).toFixed(2)}%</span>
                  <span>Juros: {results.earningsBarWidth.toFixed(2)}%</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden bg-muted flex">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${100 - results.earningsBarWidth}%` }}
                  />
                  <div
                    className="h-full bg-success"
                    style={{ width: `${results.earningsBarWidth}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                    <span>Capital: {fmtBRL(results.totalInvested)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                    <span>Juros compostos: {fmtBRL(results.totalEarnings)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução {results.showMonthly ? 'mês a mês' : 'ano a ano'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-5 font-medium text-muted-foreground">
                        Período
                      </th>
                      <th className="text-right py-2.5 px-5 font-medium text-muted-foreground">
                        Total investido
                      </th>
                      <th className="text-right py-2.5 px-5 font-medium text-muted-foreground">
                        Rendimentos
                      </th>
                      <th className="text-right py-2.5 px-5 font-medium text-muted-foreground">
                        Patrimônio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row) => (
                      <tr key={row.label} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="py-2.5 px-5 text-foreground">{row.label}</td>
                        <td className="py-2.5 px-5 text-right text-foreground">
                          {fmtBRL(row.totalInvested)}
                        </td>
                        <td className="py-2.5 px-5 text-right text-success">
                          {fmtBRL(row.earnings)}
                        </td>
                        <td className="py-2.5 px-5 text-right font-medium text-foreground">
                          {fmtBRL(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
