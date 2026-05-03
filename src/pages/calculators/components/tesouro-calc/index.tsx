import { useEffect, useState } from 'react'
import { usePortfolio } from '@/hooks/use-portfolio'
import { fetchTesouroBonds, type TesouroBond } from '@/services/tesouro'
import { getIrRate } from '../shared'
import type { BondType, Results } from './types'
import { calDays, toBondType } from './utils'
import { BondForm, GuidanceCard, ResultsSection } from './components'

export const TesouroDiretoCalc = () => {
  const { assets, loading: portfolioLoading } = usePortfolio()
  const portfolioTesouro = assets.filter((a) => a.type === 'tesouro')

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

  return (
    <div className="space-y-6">
      <BondForm
        bondType={bondType}
        amount={amount}
        spreadBuy={spreadBuy}
        spreadNow={spreadNow}
        ipcaRef={ipcaRef}
        buyDate={buyDate}
        maturityDate={maturityDate}
        autoFilledDate={autoFilledDate}
        bondsLoading={bondsLoading}
        bondsError={bondsError}
        portfolioLoading={portfolioLoading}
        portfolioTesouro={portfolioTesouro}
        groupedBonds={groupedBonds}
        selectedKey={selectedKey}
        selectedPortfolioId={selectedPortfolioId}
        onBondSelect={onBondSelect}
        onPortfolioSelect={onPortfolioSelect}
        onAmountChange={(v) => {
          setAmount(v)
          setResults(null)
        }}
        onSpreadBuyChange={(v) => {
          setSpreadBuy(v)
          setResults(null)
        }}
        onSpreadNowChange={(v) => {
          setSpreadNow(v)
          setResults(null)
        }}
        onIpcaRefChange={(v) => {
          setIpcaRef(v)
          setResults(null)
        }}
        onBuyDateChange={(v) => {
          setBuyDate(v)
          setResults(null)
        }}
        onMaturityDateChange={(v) => {
          setMaturityDate(v)
          setResults(null)
        }}
        onBondTypeChange={(v) => {
          setBondType(v)
          setSpreadBuy('')
          setSpreadNow('')
          setResults(null)
        }}
        onCalc={calcular}
        onClear={clear}
      />

      {results && <ResultsSection results={results} />}

      <GuidanceCard />
    </div>
  )
}
