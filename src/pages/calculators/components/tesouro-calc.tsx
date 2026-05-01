import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalcActions,
  CurrencyInput,
  DateInput,
  PercentInput,
  fmtBRL,
  getIrRate,
} from './shared'

type BondType = 'prefixado' | 'ipca'

const BOND_OPTIONS = [
  { value: 'prefixado', label: 'Prefixado' },
  { value: 'ipca', label: 'IPCA+' },
]

const calDays = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 86_400_000)

type Results = {
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
  bondType: BondType
}

export const TesouroDiretoCalc = () => {
  const [bondType, setBondType] = useState<BondType>('prefixado')
  const [amount, setAmount] = useState('')
  const [spreadBuy, setSpreadBuy] = useState('')
  const [spreadNow, setSpreadNow] = useState('')
  const [ipcaRef, setIpcaRef] = useState('')
  const [buyDate, setBuyDate] = useState('')
  const [maturityDate, setMaturityDate] = useState('')
  const [results, setResults] = useState<Results | null>(null)

  const clear = () => {
    setAmount('')
    setSpreadBuy('')
    setSpreadNow('')
    setIpcaRef('')
    setBuyDate('')
    setMaturityDate('')
    setResults(null)
  }

  const calcular = () => {
    const C = Number(amount)
    const sBuy = Number(spreadBuy)
    const sNow = Number(spreadNow)
    const ipca = Number(ipcaRef)
    if (C <= 0 || sBuy <= 0 || sNow <= 0 || !buyDate || !maturityDate) return
    if (bondType === 'ipca' && ipca <= 0) return

    const today = new Date()
    const buy = new Date(buyDate + 'T12:00:00')
    const maturity = new Date(maturityDate + 'T12:00:00')
    if (buy >= today || today >= maturity) return

    const rBuy =
      bondType === 'ipca'
        ? (1 + ipca / 100) * (1 + sBuy / 100) - 1
        : sBuy / 100

    const rNow =
      bondType === 'ipca'
        ? (1 + ipca / 100) * (1 + sNow / 100) - 1
        : sNow / 100

    const daysTotal = calDays(buy, maturity)
    const daysElapsed = Math.max(calDays(buy, today), 1)
    const daysRemaining = calDays(today, maturity)

    const yTotal = daysTotal / 365
    const yElapsed = daysElapsed / 365
    const yRemaining = daysRemaining / 365

    // Current market value using PU math:
    // PU_buy = 1000 / (1+rBuy)^yTotal
    // qty = C / PU_buy
    // PU_now = 1000 / (1+rNow)^yRemaining
    // currentValue = qty * PU_now = C * (1+rBuy)^yTotal / (1+rNow)^yRemaining
    const currentValue =
      (C * Math.pow(1 + rBuy, yTotal)) / Math.pow(1 + rNow, yRemaining)

    const valueAtMaturity = C * Math.pow(1 + rBuy, yTotal)

    const irSell = getIrRate(daysElapsed)
    const grossGainSell = currentValue - C
    const irAmountSell = Math.max(grossGainSell, 0) * irSell.rate
    const netGainSell = grossGainSell - irAmountSell
    const netValueSell = C + netGainSell

    const irHold = getIrRate(daysTotal)
    const grossGainHold = valueAtMaturity - C
    const irAmountHold = grossGainHold * irHold.rate
    const netGainHold = grossGainHold - irAmountHold
    const netValueHold = C + netGainHold

    const annualizedSell = (Math.pow(netValueSell / C, 1 / yElapsed) - 1) * 100
    const annualizedHold = (Math.pow(netValueHold / C, 1 / yTotal) - 1) * 100

    setResults({
      daysElapsed,
      daysRemaining,
      daysTotal,
      currentValue,
      valueAtMaturity,
      grossGainSell,
      irAmountSell,
      netGainSell,
      netValueSell,
      grossGainHold,
      irAmountHold,
      netGainHold,
      netValueHold,
      annualizedSell,
      annualizedHold,
      irLabelSell: irSell.label,
      irLabelHold: irHold.label,
      irRateSell: irSell.rate,
      irRateHold: irHold.rate,
      buyRate: sBuy,
      currentRate: sNow,
      bondType,
    })
  }

  const ratesRose = results && results.currentRate > results.buyRate
  const ratesFell = results && results.currentRate < results.buyRate

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Marcação a Mercado — Tesouro Direto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              id="td-amount"
              label="Valor investido"
              value={amount}
              onChange={(v) => { setAmount(v); setResults(null) }}
              placeholder="5000"
            />
            <PercentInput
              id="td-spread-buy"
              label={bondType === 'ipca' ? 'IPCA+ de compra (spread % a.a.)' : 'Taxa de compra (% a.a.)'}
              value={spreadBuy}
              onChange={(v) => { setSpreadBuy(v); setResults(null) }}
              placeholder={bondType === 'ipca' ? 'ex: 6.50' : 'ex: 13.50'}
              showPrefix={false}
              selectValue={bondType}
              selectOptions={BOND_OPTIONS}
              onSelectChange={(v) => { setBondType(v as BondType); setSpreadBuy(''); setSpreadNow(''); setResults(null) }}
            />
            {bondType === 'ipca' && (
              <PercentInput
                id="td-ipca"
                label="IPCA de referência (% a.a.)"
                value={ipcaRef}
                onChange={(v) => { setIpcaRef(v); setResults(null) }}
                placeholder="ex: 5.50"
              />
            )}
            <PercentInput
              id="td-spread-now"
              label={bondType === 'ipca' ? 'IPCA+ atual do mercado (spread % a.a.)' : 'Taxa atual do mercado (% a.a.)'}
              value={spreadNow}
              onChange={(v) => { setSpreadNow(v); setResults(null) }}
              placeholder={bondType === 'ipca' ? 'ex: 7.20' : 'ex: 12.80'}
            />
            <DateInput
              id="td-buy-date"
              label="Data de compra"
              value={buyDate}
              onChange={(v) => { setBuyDate(v); setResults(null) }}
            />
            <DateInput
              id="td-maturity-date"
              label="Data de vencimento"
              value={maturityDate}
              onChange={(v) => { setMaturityDate(v); setResults(null) }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Consulte a taxa atual do seu título em{' '}
            <a
              href="https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              tesourodireto.com.br → Preços e Taxas
            </a>
          </p>
          <CalcActions onCalc={calcular} onClear={clear} />
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Valor atual de mercado</CardTitle>
                <p className="text-2xl font-bold text-foreground">{fmtBRL(results.currentValue)}</p>
                <p className="text-xs text-muted-foreground">{results.daysElapsed} dias decorridos</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ganho bruto acumulado</CardTitle>
                <p className={`text-2xl font-bold ${results.grossGainSell >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {fmtBRL(results.grossGainSell)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((results.grossGainSell / results.currentValue) * 100).toFixed(2)}% de valorização
                </p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Valor no vencimento</CardTitle>
                <p className="text-2xl font-bold text-foreground">{fmtBRL(results.valueAtMaturity)}</p>
                <p className="text-xs text-muted-foreground">{results.daysRemaining} dias restantes</p>
              </CardHeader>
            </Card>
          </div>

          {/* Insight */}
          <Card className={ratesFell ? 'border-success/40 bg-success/5' : ratesRose ? 'border-destructive/40 bg-destructive/5' : 'bg-muted/40'}>
            <CardContent className="pt-5 pb-5 space-y-1">
              {ratesFell && (
                <>
                  <p className="text-sm font-semibold text-success">
                    Título valorizou — taxas caíram de {results.buyRate.toFixed(2)}% para {results.currentRate.toFixed(2)}% a.a.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você pode vender agora e realizar{' '}
                    <strong className="text-foreground">{results.annualizedSell.toFixed(2)}% a.a. líq.</strong> no período decorrido,
                    ou segurar até o vencimento e garantir{' '}
                    <strong className="text-foreground">{results.annualizedHold.toFixed(2)}% a.a. líq.</strong> total.
                    Vender e reinvestir no mesmo título ao prazo restante resulta no mesmo valor final bruto — a diferença real está no IR e no que você faz com o capital.
                  </p>
                </>
              )}
              {ratesRose && (
                <>
                  <p className="text-sm font-semibold text-destructive">
                    Título desvalorizou — taxas subiram de {results.buyRate.toFixed(2)}% para {results.currentRate.toFixed(2)}% a.a.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vender agora realizaria apenas{' '}
                    <strong className="text-foreground">{results.annualizedSell.toFixed(2)}% a.a. líq.</strong> no período decorrido.
                    Segurando até o vencimento, você garante os{' '}
                    <strong className="text-foreground">{results.annualizedHold.toFixed(2)}% a.a. líq.</strong> originais — o preço de mercado não afeta quem carrega o título até o final.
                  </p>
                </>
              )}
              {!ratesFell && !ratesRose && (
                <p className="text-sm text-muted-foreground">
                  Taxas estáveis — os resultados de vender agora e segurar até o vencimento são equivalentes.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Vender agora</CardTitle>
                <p className="text-xs text-muted-foreground">IR calculado sobre {results.daysElapsed} dias</p>
              </CardHeader>
              <CardContent>
                {[
                  { label: 'Valor bruto de venda', value: fmtBRL(results.currentValue) },
                  { label: `IR (${(results.irRateSell * 100).toFixed(2)}% — ${results.irLabelSell})`, value: `- ${fmtBRL(results.irAmountSell)}`, color: 'text-destructive' },
                  { label: 'Ganho líquido', value: fmtBRL(results.netGainSell), color: results.netGainSell >= 0 ? 'text-success' : 'text-destructive' },
                  { label: 'Valor líquido recebido', value: fmtBRL(results.netValueSell) },
                  { label: 'Rentabilidade líq. a.a.', value: `${results.annualizedSell.toFixed(2)}% a.a.`, color: 'text-primary font-bold' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground">{row.label}</p>
                    <p className={`text-sm font-semibold ${row.color ?? 'text-foreground'}`}>{row.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segurar até o vencimento</CardTitle>
                <p className="text-xs text-muted-foreground">IR calculado sobre {results.daysTotal} dias</p>
              </CardHeader>
              <CardContent>
                {[
                  { label: 'Valor bruto no vencimento', value: fmtBRL(results.valueAtMaturity) },
                  { label: `IR (${(results.irRateHold * 100).toFixed(2)}% — ${results.irLabelHold})`, value: `- ${fmtBRL(results.irAmountHold)}`, color: 'text-destructive' },
                  { label: 'Ganho líquido', value: fmtBRL(results.netGainHold), color: 'text-success' },
                  { label: 'Valor líquido recebido', value: fmtBRL(results.netValueHold) },
                  { label: 'Rentabilidade líq. a.a.', value: `${results.annualizedHold.toFixed(2)}% a.a.`, color: 'text-primary font-bold' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground">{row.label}</p>
                    <p className={`text-sm font-semibold ${row.color ?? 'text-foreground'}`}>{row.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
