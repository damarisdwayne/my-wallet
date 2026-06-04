import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompact } from '@/lib/utils'
import { CalcActions, CurrencyInput, PercentInput, fmtBRL } from '../../shared'

const GROWTH_COLOR = 'hsl(142 71% 45%)'
const MAX_YEARS = 50

type GrowthPoint = { year: number; value: number }

type IFResults = {
  plNeeded: number // patrimônio que gera a renda desejada (sem reinvestir)
  plAdjusted: number // patrimônio para manter o poder de compra (reinvestindo parte)
  grossMonthly: number // renda bruta mensal gerada pelo patrimônio ajustado
  reinvestMonthly: number // quanto se reinveste por mês
  growthPct: number // crescimento anual do patrimônio via reinvestimento (% a.a.)
}

const GrowthTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: GrowthPoint }[]
}) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground text-sm">{fmtBRL(d.value)}</p>
      <p className="text-muted-foreground mt-0.5">Ano {d.year}</p>
    </div>
  )
}

export const SimuladorIF = () => {
  const [income, setIncome] = useState('')
  const [annualReturn, setAnnualReturn] = useState('')
  const [reinvestPct, setReinvestPct] = useState('')
  const [projectionYears, setProjectionYears] = useState('10')
  const [results, setResults] = useState<IFResults | null>(null)

  const reset = () => {
    setIncome('')
    setAnnualReturn('')
    setReinvestPct('')
    setProjectionYears('10')
    setResults(null)
  }

  const calcular = () => {
    const renda = Number(income) || 0
    const y = (Number(annualReturn) || 0) / 100
    const reinv = (Number(reinvestPct) || 0) / 100
    if (!renda || !y || reinv >= 1) return

    const annual = renda * 12
    const plNeeded = annual / y
    // Reinvestir parte da renda mantém o poder de compra → precisa de mais patrimônio para que,
    // depois de reinvestir, a renda líquida ainda seja a desejada.
    const plAdjusted = annual / (y * (1 - reinv))
    const grossMonthly = (plAdjusted * y) / 12
    const reinvestMonthly = grossMonthly * reinv
    const growthPct = y * reinv * 100

    setResults({ plNeeded, plAdjusted, grossMonthly, reinvestMonthly, growthPct })
  }

  // Projeção do crescimento, derivada ao vivo do nº de anos escolhido (Ano 1 = patrimônio de hoje).
  const years = Math.min(Math.max(Math.round(Number(projectionYears) || 0), 1), MAX_YEARS)
  const rate = results ? results.growthPct / 100 : 0
  const growthSeries: GrowthPoint[] = results
    ? Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        value: results.plAdjusted * Math.pow(1 + rate, i),
      }))
    : []
  const tickInterval = years <= 12 ? 0 : Math.ceil(years / 12)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Simulador de Independência Financeira
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Quanto você precisa juntar para viver da renda dos investimentos.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput
            id="if-income"
            label="Renda mensal desejada"
            value={income}
            onChange={setIncome}
          />
          <PercentInput
            id="if-return"
            label="Rentabilidade anual (yield)"
            value={annualReturn}
            onChange={setAnnualReturn}
            placeholder="6"
          />
        </div>
        <PercentInput
          id="if-reinvest"
          label="Reinvestir para manter o poder de compra"
          value={reinvestPct}
          onChange={setReinvestPct}
          placeholder="30"
        />
        <CalcActions onCalc={calcular} onClear={reset} />

        {results && (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patrimônio necessário</CardTitle>
                  <p className="text-2xl font-bold text-foreground">{fmtBRL(results.plNeeded)}</p>
                  <p className="text-xs text-muted-foreground">
                    gera {fmtBRL(Number(income))}/mês, sem reinvestir
                  </p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Patrimônio ajustado</CardTitle>
                  <p className="text-2xl font-bold text-success">{fmtBRL(results.plAdjusted)}</p>
                  <p className="text-xs text-muted-foreground">
                    mantendo o poder de compra (reinveste {Number(reinvestPct)}%)
                  </p>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Como fica a renda do patrimônio ajustado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Renda bruta mensal</span>
                  <span className="font-medium text-foreground">
                    {fmtBRL(results.grossMonthly)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reinveste por mês</span>
                  <span className="font-medium text-warning">
                    {fmtBRL(results.reinvestMonthly)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Sobra para viver</span>
                  <span className="font-semibold text-success">{fmtBRL(Number(income))}/mês</span>
                </div>
              </CardContent>
            </Card>

            {results.growthPct > 0 && (
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                  <CardTitle>Crescimento do patrimônio</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label htmlFor="if-years" className="text-xs text-muted-foreground">
                      Projeção
                    </label>
                    <input
                      id="if-years"
                      type="number"
                      min="1"
                      max={MAX_YEARS}
                      value={projectionYears}
                      onChange={(e) => setProjectionYears(e.target.value)}
                      className="w-12 rounded-md border border-input bg-background px-2 py-1 text-center text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-muted-foreground">anos</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-foreground">
                    Reinvestindo {Number(reinvestPct)}%, seu patrimônio cresce cerca de{' '}
                    <span className="font-semibold text-success">
                      {results.growthPct.toFixed(1)}% ao ano
                    </span>
                    {' ao longo dos anos:'}
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={growthSeries}
                      margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                      barCategoryGap="20%"
                    >
                      <defs>
                        <linearGradient id="ifGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={GROWTH_COLOR} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={GROWTH_COLOR} stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
                      <XAxis
                        dataKey="year"
                        interval={tickInterval}
                        tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={formatCompact}
                        tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.45 }}
                        tickLine={false}
                        axisLine={false}
                        width={56}
                      />
                      <Tooltip content={<GrowthTooltip />} cursor={{ opacity: 0.06 }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="url(#ifGrowthGrad)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground">
                    Esse crescimento é o que protege da inflação: se {results.growthPct.toFixed(1)}%
                    for maior ou igual à inflação esperada, seu poder de compra se mantém.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
