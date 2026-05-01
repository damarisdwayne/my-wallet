import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePortfolio } from '@/hooks/use-portfolio'
import { fetchTesouroBonds, type TesouroBond } from '@/services/tesouro'
import {
  CalcActions,
  CurrencyInput,
  DateInput,
  Field,
  PercentInput,
  fmtBRL,
  getIrRate,
} from './shared'

type BondType = 'prefixado' | 'ipca'

const BOND_OPTIONS = [
  { value: 'prefixado', label: 'Prefixado' },
  { value: 'ipca', label: 'IPCA+' },
]

const calDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000)

const toBondType = (tipo: string): BondType | null => {
  const t = tipo.toLowerCase()
  if (t.includes('prefixado')) return 'prefixado'
  if (t.includes('ipca')) return 'ipca'
  return null
}

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
}

export const TesouroDiretoCalc = () => {
  const { assets } = usePortfolio()
  const portfolioTesouro = assets.filter(
    (a) => a.type === 'fixed_income' && a.ticker.toUpperCase().startsWith('TESOURO'),
  )

  const [bonds, setBonds] = useState<TesouroBond[]>([])
  const [bondsLoading, setBondsLoading] = useState(true)
  const [bondsError, setBondsError] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState('')
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('')

  const [bondType, setBondType] = useState<BondType>('prefixado')
  const [amount, setAmount] = useState('')
  const [spreadBuy, setSpreadBuy] = useState('')
  const [spreadNow, setSpreadNow] = useState('')
  const [ipcaRef, setIpcaRef] = useState('')
  const [buyDate, setBuyDate] = useState('')
  const [maturityDate, setMaturityDate] = useState('')
  const [autoFilledDate, setAutoFilledDate] = useState<string | null>(null)
  const [results, setResults] = useState<Results | null>(null)

  useEffect(() => {
    fetchTesouroBonds()
      .then((data) => setBonds(data.filter((b) => toBondType(b.tipo) !== null)))
      .catch((e: unknown) =>
        setBondsError(e instanceof Error ? e.message : 'Erro ao carregar títulos'),
      )
      .finally(() => setBondsLoading(false))
  }, [])

  const supportedBonds = bonds
  const groupedBonds = supportedBonds.reduce<Record<string, TesouroBond[]>>((acc, b) => {
    if (!acc[b.tipo]) acc[b.tipo] = []
    acc[b.tipo].push(b)
    return acc
  }, {})

  const onBondSelect = (key: string) => {
    setSelectedKey(key)
    setResults(null)
    if (!key) return
    const bond = bonds.find((b) => b.ticker === key)
    if (!bond) return
    const type = toBondType(bond.tipo)
    if (type) setBondType(type)
    setSpreadNow(bond.taxaVenda.toFixed(2))
    setMaturityDate(bond.maturityISO)
    setAutoFilledDate(bond.dataBase)
  }

  const onPortfolioSelect = (id: string) => {
    setSelectedPortfolioId(id)
    setResults(null)
    if (!id) return
    const asset = portfolioTesouro.find((a) => a.id === id)
    if (!asset) return
    const type = toBondType(asset.ticker)
    if (type) setBondType(type)
    setAmount(String(asset.avgPrice.toFixed(2)))
    const rate = asset.prefixedRate ?? asset.indexerRate
    if (rate) setSpreadBuy(String(rate))
    if (asset.operationDate) setBuyDate(asset.operationDate)
    if (asset.maturityDate) setMaturityDate(asset.maturityDate)
    setSelectedKey('')
    setAutoFilledDate(null)
  }

  const clear = () => {
    setSelectedKey('')
    setSelectedPortfolioId('')
    setAmount('')
    setSpreadBuy('')
    setSpreadNow('')
    setIpcaRef('')
    setBuyDate('')
    setMaturityDate('')
    setAutoFilledDate(null)
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

    const rBuy = bondType === 'ipca' ? (1 + ipca / 100) * (1 + sBuy / 100) - 1 : sBuy / 100
    const rNow = bondType === 'ipca' ? (1 + ipca / 100) * (1 + sNow / 100) - 1 : sNow / 100

    const daysTotal = calDays(buy, maturity)
    const daysElapsed = Math.max(calDays(buy, today), 1)
    const daysRemaining = calDays(today, maturity)
    const yTotal = daysTotal / 365
    const yElapsed = daysElapsed / 365
    const yRemaining = daysRemaining / 365

    const currentValue = (C * Math.pow(1 + rBuy, yTotal)) / Math.pow(1 + rNow, yRemaining)
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
      annualizedSell: (Math.pow(netValueSell / C, 1 / yElapsed) - 1) * 100,
      annualizedHold: (Math.pow(netValueHold / C, 1 / yTotal) - 1) * 100,
      irLabelSell: irSell.label,
      irLabelHold: irHold.label,
      irRateSell: irSell.rate,
      irRateHold: irHold.rate,
      buyRate: sBuy,
      currentRate: sNow,
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
          {/* Portfolio picker */}
          {portfolioTesouro.length > 0 && (
            <Field label="Meus títulos no portfólio">
              <select
                value={selectedPortfolioId}
                onChange={(e) => onPortfolioSelect(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— selecione para preencher automaticamente —</option>
                {portfolioTesouro.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.ticker}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Bond picker */}
          <Field label="Selecionar título">
            <select
              value={selectedKey}
              onChange={(e) => onBondSelect(e.target.value)}
              disabled={bondsLoading}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">
                {bondsLoading
                  ? 'Carregando títulos...'
                  : bondsError
                    ? 'Erro ao carregar títulos'
                    : '— preencha manualmente ou selecione um título —'}
              </option>
              {Object.entries(groupedBonds).map(([tipo, list]) => (
                <optgroup key={tipo} label={tipo}>
                  {list.map((b) => (
                    <option key={b.ticker} value={b.ticker}>
                      {b.vencimento} — taxa venda: {b.taxaVenda.toFixed(2)}%
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {autoFilledDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Taxas e vencimento auto-preenchidos · referência: {autoFilledDate}
              </p>
            )}
            {bondsError && <p className="text-xs text-destructive mt-1">{bondsError}</p>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencyInput
              id="td-amount"
              label="Preço de compra (PU)"
              value={amount}
              onChange={(v) => {
                setAmount(v)
                setResults(null)
              }}
              placeholder="2870.00"
            />
            <PercentInput
              id="td-spread-buy"
              label={
                bondType === 'ipca' ? 'IPCA+ de compra (spread % a.a.)' : 'Taxa de compra (% a.a.)'
              }
              value={spreadBuy}
              onChange={(v) => {
                setSpreadBuy(v)
                setResults(null)
              }}
              placeholder={bondType === 'ipca' ? 'ex: 6.50' : 'ex: 13.50'}
              showPrefix={false}
              selectValue={bondType}
              selectOptions={BOND_OPTIONS}
              onSelectChange={(v) => {
                setBondType(v as BondType)
                setSpreadBuy('')
                setSpreadNow('')
                setResults(null)
              }}
            />
            {bondType === 'ipca' && (
              <PercentInput
                id="td-ipca"
                label="IPCA de referência (% a.a.)"
                value={ipcaRef}
                onChange={(v) => {
                  setIpcaRef(v)
                  setResults(null)
                }}
                placeholder="ex: 5.50"
              />
            )}
            <PercentInput
              id="td-spread-now"
              label={
                bondType === 'ipca'
                  ? 'IPCA+ atual do mercado (spread % a.a.)'
                  : 'Taxa atual do mercado (% a.a.)'
              }
              value={spreadNow}
              onChange={(v) => {
                setSpreadNow(v)
                setResults(null)
              }}
              placeholder={bondType === 'ipca' ? 'ex: 7.20' : 'ex: 12.80'}
            />
            <DateInput
              id="td-buy-date"
              label="Data de compra"
              value={buyDate}
              onChange={(v) => {
                setBuyDate(v)
                setResults(null)
              }}
            />
            <DateInput
              id="td-maturity-date"
              label="Data de vencimento"
              value={maturityDate}
              onChange={(v) => {
                setMaturityDate(v)
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
                <CardTitle>Valor atual de mercado</CardTitle>
                <p className="text-2xl font-bold text-foreground">{fmtBRL(results.currentValue)}</p>
                <p className="text-xs text-muted-foreground">
                  {results.daysElapsed} dias decorridos
                </p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ganho bruto acumulado</CardTitle>
                <p
                  className={`text-2xl font-bold ${results.grossGainSell >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {fmtBRL(results.grossGainSell)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((results.grossGainSell / results.currentValue) * 100).toFixed(2)}% de
                  valorização
                </p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Valor no vencimento</CardTitle>
                <p className="text-2xl font-bold text-foreground">
                  {fmtBRL(results.valueAtMaturity)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {results.daysRemaining} dias restantes
                </p>
              </CardHeader>
            </Card>
          </div>

          <Card
            className={
              ratesFell
                ? 'border-success/40 bg-success/5'
                : ratesRose
                  ? 'border-destructive/40 bg-destructive/5'
                  : 'bg-muted/40'
            }
          >
            <CardContent className="pt-5 pb-5 space-y-1">
              {ratesFell && (
                <>
                  <p className="text-sm font-semibold text-success">
                    Título valorizou — taxas caíram de {results.buyRate.toFixed(2)}% para{' '}
                    {results.currentRate.toFixed(2)}% a.a.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você pode vender agora e realizar{' '}
                    <strong className="text-foreground">
                      {results.annualizedSell.toFixed(2)}% a.a. líq.
                    </strong>{' '}
                    no período decorrido, ou segurar até o vencimento e garantir{' '}
                    <strong className="text-foreground">
                      {results.annualizedHold.toFixed(2)}% a.a. líq.
                    </strong>{' '}
                    total. Vender e reinvestir no mesmo título resulta no mesmo valor bruto final —
                    a diferença real está no IR e no que você faz com o capital.
                  </p>
                </>
              )}
              {ratesRose && (
                <>
                  <p className="text-sm font-semibold text-destructive">
                    Título desvalorizou — taxas subiram de {results.buyRate.toFixed(2)}% para{' '}
                    {results.currentRate.toFixed(2)}% a.a.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vender agora realizaria apenas{' '}
                    <strong className="text-foreground">
                      {results.annualizedSell.toFixed(2)}% a.a. líq.
                    </strong>{' '}
                    no período decorrido. Segurando até o vencimento, você garante os{' '}
                    <strong className="text-foreground">
                      {results.annualizedHold.toFixed(2)}% a.a. líq.
                    </strong>{' '}
                    originais.
                  </p>
                </>
              )}
              {!ratesFell && !ratesRose && (
                <p className="text-sm text-muted-foreground">
                  Taxas estáveis — os resultados de vender agora e segurar até o vencimento são
                  equivalentes.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Vender agora</CardTitle>
                <p className="text-xs text-muted-foreground">
                  IR calculado sobre {results.daysElapsed} dias
                </p>
              </CardHeader>
              <CardContent>
                {[
                  { label: 'Valor bruto de venda', value: fmtBRL(results.currentValue) },
                  {
                    label: `IR (${(results.irRateSell * 100).toFixed(2)}% — ${results.irLabelSell})`,
                    value: `- ${fmtBRL(results.irAmountSell)}`,
                    color: 'text-destructive',
                  },
                  {
                    label: 'Ganho líquido',
                    value: fmtBRL(results.netGainSell),
                    color: results.netGainSell >= 0 ? 'text-success' : 'text-destructive',
                  },
                  { label: 'Valor líquido recebido', value: fmtBRL(results.netValueSell) },
                  {
                    label: 'Rentabilidade líq. a.a.',
                    value: `${results.annualizedSell.toFixed(2)}% a.a.`,
                    color: 'text-primary',
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

            <Card>
              <CardHeader>
                <CardTitle>Segurar até o vencimento</CardTitle>
                <p className="text-xs text-muted-foreground">
                  IR calculado sobre {results.daysTotal} dias
                </p>
              </CardHeader>
              <CardContent>
                {[
                  { label: 'Valor bruto no vencimento', value: fmtBRL(results.valueAtMaturity) },
                  {
                    label: `IR (${(results.irRateHold * 100).toFixed(2)}% — ${results.irLabelHold})`,
                    value: `- ${fmtBRL(results.irAmountHold)}`,
                    color: 'text-destructive',
                  },
                  {
                    label: 'Ganho líquido',
                    value: fmtBRL(results.netGainHold),
                    color: 'text-success',
                  },
                  { label: 'Valor líquido recebido', value: fmtBRL(results.netValueHold) },
                  {
                    label: 'Rentabilidade líq. a.a.',
                    value: `${results.annualizedHold.toFixed(2)}% a.a.`,
                    color: 'text-primary',
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
          </div>
        </>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-foreground mb-2">Quando vale a pena vender?</p>
          <p className="text-sm text-muted-foreground mb-3">
            O preço sobe quando a taxa cai. Quanto mais tempo resta até o vencimento, maior o impacto
            de cada ponto percentual (pp) de queda.
          </p>
          <div className="space-y-2">
            {[
              { range: 'Taxa subiu', action: 'Não vende — você realizaria prejuízo', color: 'text-destructive' },
              { range: 'Caiu < 0,5 pp', action: 'Não vale — IR come o ganho', color: 'text-destructive' },
              { range: 'Caiu 0,5–1 pp', action: 'Talvez — compare as rentabilidades acima', color: 'text-warning' },
              { range: 'Caiu > 1 pp', action: 'Provavelmente sim, principalmente com vencimento longo', color: 'text-success' },
            ].map((row) => (
              <div key={row.range} className="flex items-start gap-3 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">{row.range}</span>
                <span className={row.color}>{row.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
