import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalcActions,
  CurrencyInput,
  NumberInput,
  PercentInput,
  fmtBRL,
} from '../../shared'

export type IFResults = {
  monthlyContrib: number
  projectedPatrimony: number
  monthlyPassiveIncome: number
  targetReached: boolean
  gap: number
  sustainabilityYears: number | null
}

export const SimuladorIF = () => {
  const [income, setIncome] = useState('')
  const [currentPatrimony, setCurrentPatrimony] = useState('')
  const [targetPatrimony, setTargetPatrimony] = useState('')
  const [investPct, setInvestPct] = useState('')
  const [currentAge, setCurrentAge] = useState('')
  const [retirementAge, setRetirementAge] = useState('')
  const [annualReturn, setAnnualReturn] = useState('')
  const [monthlySpending, setMonthlySpending] = useState('')
  const [results, setResults] = useState<IFResults | null>(null)

  const reset = () => {
    setIncome('')
    setCurrentPatrimony('')
    setTargetPatrimony('')
    setInvestPct('')
    setCurrentAge('')
    setRetirementAge('')
    setAnnualReturn('')
    setMonthlySpending('')
    setResults(null)
  }

  const calcular = () => {
    const inc = Number(income) || 0
    const pv = Number(currentPatrimony) || 0
    const target = Number(targetPatrimony) || 0
    const pct = Number(investPct) || 0
    const age = Number(currentAge)
    const apoAge = Number(retirementAge)
    const rAnnual = Number(annualReturn) / 100
    const spending = Number(monthlySpending) || 0

    if (!inc || !pct || !age || !apoAge || !rAnnual || apoAge <= age) return

    const pmt = inc * (pct / 100)
    const n = (apoAge - age) * 12
    const rm = Math.pow(1 + rAnnual, 1 / 12) - 1

    const fv =
      pv * Math.pow(1 + rm, n) + (rm > 0 ? pmt * ((Math.pow(1 + rm, n) - 1) / rm) : pmt * n)

    const passiveIncome = fv * rm

    let sustainabilityYears: number | null = null
    if (spending > 0 && spending > passiveIncome) {
      const months = -Math.log(1 - (fv * rm) / spending) / Math.log(1 + rm)
      sustainabilityYears = Math.floor(months / 12)
    }

    setResults({
      monthlyContrib: pmt,
      projectedPatrimony: fv,
      monthlyPassiveIncome: passiveIncome,
      targetReached: target > 0 ? fv >= target : true,
      gap: fv - target,
      sustainabilityYears,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Simulador de Independência Financeira
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput id="if-income" label="Renda mensal" value={income} onChange={setIncome} />
          <CurrencyInput
            id="if-patrimony"
            label="Patrimônio atual"
            value={currentPatrimony}
            onChange={setCurrentPatrimony}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput
            id="if-target"
            label="Meta de patrimônio para aposentar"
            value={targetPatrimony}
            onChange={setTargetPatrimony}
          />
          <PercentInput
            id="if-invest-pct"
            label="% da renda que investe"
            value={investPct}
            onChange={setInvestPct}
            placeholder="0"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            id="if-current-age"
            label="Idade atual"
            value={currentAge}
            onChange={setCurrentAge}
            placeholder="30"
            suffix="anos"
          />
          <NumberInput
            id="if-retirement-age"
            label="Idade desejada para aposentar"
            value={retirementAge}
            onChange={setRetirementAge}
            placeholder="60"
            suffix="anos"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PercentInput
            id="if-return"
            label="Rentabilidade anual projetada"
            value={annualReturn}
            onChange={setAnnualReturn}
            placeholder="10"
          />
          <CurrencyInput
            id="if-spending"
            label="Gasto mensal planejado aposentado"
            value={monthlySpending}
            onChange={setMonthlySpending}
          />
        </div>
        <CalcActions onCalc={calcular} onClear={reset} />

        {results && (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aporte mensal</CardTitle>
                  <p className="text-2xl font-bold text-foreground">
                    {fmtBRL(results.monthlyContrib)}
                  </p>
                  <p className="text-xs text-muted-foreground">valor calculado pela % da renda</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Patrimônio projetado</CardTitle>
                  <p className="text-2xl font-bold text-foreground">
                    {fmtBRL(results.projectedPatrimony)}
                  </p>
                  {Number(targetPatrimony) > 0 && (
                    <p
                      className={`text-xs font-medium ${results.targetReached ? 'text-success' : 'text-destructive'}`}
                    >
                      {results.targetReached
                        ? `${fmtBRL(results.gap)} acima da meta`
                        : `${fmtBRL(Math.abs(results.gap))} abaixo da meta`}
                    </p>
                  )}
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Renda mensal passiva</CardTitle>
                  <p className="text-2xl font-bold text-success">
                    {fmtBRL(results.monthlyPassiveIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground">apenas com os juros do patrimônio</p>
                </CardHeader>
              </Card>
            </div>

            {Number(monthlySpending) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sustentabilidade do patrimônio</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.sustainabilityYears === null ? (
                    <p className="text-sm text-success font-medium">
                      Patrimônio sustentável indefinidamente — os juros cobrem o gasto planejado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">
                        Com o gasto de{' '}
                        <span className="font-medium">{fmtBRL(Number(monthlySpending))}/mês</span>,
                        o patrimônio dura aproximadamente{' '}
                        <span className="font-semibold text-warning">
                          {results.sustainabilityYears} anos
                        </span>{' '}
                        após a aposentadoria.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Para ser indefinidamente sustentável, reduza o gasto para até{' '}
                        {fmtBRL(results.monthlyPassiveIncome)}/mês.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
