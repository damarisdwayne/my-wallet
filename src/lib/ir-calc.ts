import type { Asset, AssetType, Dividend, Trade } from '@/types'

/* ── types ── */

export interface IrPosition {
  ticker: string
  assetName: string
  assetType: AssetType
  quantity: number
  avgCost: number
  totalCost: number
  dirpfGroup: string
  dirpfCode: string
}

export interface RealizedGain {
  ticker: string
  date: string
  month: string
  quantity: number
  avgCost: number
  sellPrice: number
  sellTotal: number
  costTotal: number
  gain: number
  assetType: AssetType
}

export interface MonthlyRV {
  month: string
  sales: number
  gain: number
  isExempt: boolean
  lossCarryoverIn: number
  netTaxable: number
  irDue: number
  lossCarryoverOut: number
}

export interface RendimentoIsento {
  ticker: string
  cnpj: string
  type: string
  code: string
  amount: number
}

export interface RendimentoTributavel {
  ticker: string
  cnpj: string
  type: string
  code: string
  gross: number
  ir: number
  net: number
}

/* ── DIRPF codes ── */

const DIRPF: Record<AssetType, { group: string; code: string }> = {
  stock: { group: '03', code: '01' },
  fii: { group: '07', code: '03' },
  etf: { group: '07', code: '09' },
  bdr: { group: '03', code: '04' },
  fixed_income: { group: '04', code: '01' },
  crypto: { group: '08', code: '01' },
  stock_us: { group: '03', code: '04' },
  other: { group: '99', code: '99' },
}

/* ── helpers ── */

const posKey = (ticker: string) => ticker.toUpperCase()

type PositionMap = Record<string, { quantity: number; avgCost: number; totalCost: number }>

const applyTrade = (map: PositionMap, trade: Trade) => {
  const key = posKey(trade.ticker)
  if (!map[key]) map[key] = { quantity: 0, avgCost: 0, totalCost: 0 }
  const pos = map[key]

  if (trade.type === 'buy') {
    const newQty = pos.quantity + trade.quantity
    const newTotal = pos.totalCost + (trade.label === 'bonificacao' ? 0 : trade.total)
    pos.avgCost = newQty > 0 ? newTotal / newQty : 0
    pos.quantity = newQty
    pos.totalCost = newTotal
  } else if (trade.type === 'sell') {
    const soldQty = Math.min(trade.quantity, pos.quantity)
    pos.quantity = Math.max(0, pos.quantity - soldQty)
    pos.totalCost = pos.avgCost * pos.quantity
  }
}

/* ── public functions ── */

/** Position per ticker at endDate (inclusive). */
export const buildPositions = (
  trades: Trade[],
  endDate: string,
  assets: Asset[],
): IrPosition[] => {
  const assetMap = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a]))
  const map: PositionMap = {}

  trades
    .filter((t) => t.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) => applyTrade(map, t))

  return Object.entries(map)
    .filter(([, p]) => p.quantity > 0.0001)
    .map(([ticker, p]) => {
      const asset = assetMap[ticker]
      const type: AssetType = asset?.type ?? 'other'
      return {
        ticker,
        assetName: asset?.name ?? ticker,
        assetType: type,
        quantity: p.quantity,
        avgCost: p.avgCost,
        totalCost: p.totalCost,
        dirpfGroup: DIRPF[type].group,
        dirpfCode: DIRPF[type].code,
      }
    })
    .sort((a, b) => a.ticker.localeCompare(b.ticker))
}

/** Realized gains for sells occurring in the given year. */
export const calcRealizedGains = (allTrades: Trade[], year: number, assets: Asset[]): RealizedGain[] => {
  const assetMap = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a]))
  const gains: RealizedGain[] = []
  const map: PositionMap = {}

  const sorted = [...allTrades]
    .filter((t) => t.date <= `${year}-12-31`)
    .sort((a, b) => a.date.localeCompare(b.date))

  for (const trade of sorted) {
    const key = posKey(trade.ticker)
    if (!map[key]) map[key] = { quantity: 0, avgCost: 0, totalCost: 0 }
    const pos = map[key]
    const tradeYear = Number(trade.date.slice(0, 4))

    if (trade.type === 'buy') {
      applyTrade(map, trade)
    } else if (trade.type === 'sell') {
      const soldQty = Math.min(trade.quantity, pos.quantity)
      const costTotal = pos.avgCost * soldQty
      const sellTotal = trade.price * soldQty
      const gain = sellTotal - costTotal

      if (tradeYear === year) {
        gains.push({
          ticker: trade.ticker.toUpperCase(),
          date: trade.date,
          month: trade.date.slice(0, 7),
          quantity: soldQty,
          avgCost: pos.avgCost,
          sellPrice: trade.price,
          sellTotal,
          costTotal,
          gain,
          assetType: assetMap[key]?.type ?? 'other',
        })
      }

      pos.quantity = Math.max(0, pos.quantity - soldQty)
      pos.totalCost = pos.avgCost * pos.quantity
    }
  }

  return gains
}

/** Monthly renda variável aggregation from realized gains. */
export const calcMonthlyRV = (gains: RealizedGain[], year: number): MonthlyRV[] => {
  // aggregate per month
  const byMonth: Record<string, { sales: number; gain: number }> = {}
  for (const g of gains) {
    if (!byMonth[g.month]) byMonth[g.month] = { sales: 0, gain: 0 }
    byMonth[g.month].sales += g.sellTotal
    byMonth[g.month].gain += g.gain
  }

  // fill all 12 months
  const result: MonthlyRV[] = []
  let carryover = 0

  for (let m = 1; m <= 12; m++) {
    const month = `${year}-${String(m).padStart(2, '0')}`
    const { sales = 0, gain = 0 } = byMonth[month] ?? {}
    const isExempt = sales <= 20000 && gain > 0
    const taxableGain = isExempt ? 0 : gain
    const lossCarryoverIn = carryover
    const afterCarry = taxableGain - lossCarryoverIn
    const netTaxable = Math.max(0, afterCarry)
    const irDue = netTaxable * 0.15

    // update carryover
    if (gain < 0) {
      carryover += Math.abs(gain)
    } else if (!isExempt) {
      carryover = afterCarry < 0 ? Math.abs(afterCarry) : 0
    }

    const lossCarryoverOut = carryover

    result.push({ month, sales, gain, isExempt, lossCarryoverIn, netTaxable, irDue, lossCarryoverOut })
  }

  return result
}

/** Rendimentos isentos for the year from dividends. */
export const calcRendimentosIsentos = (dividends: Dividend[], year: number): RendimentoIsento[] => {
  const filtered = dividends.filter((d) => d.paymentDate.startsWith(String(year)))

  // dividendos de ações (isento - código 09)
  const divByTicker: Record<string, number> = {}
  // FII rendimentos (isento - código 99)
  const fiiByTicker: Record<string, number> = {}

  for (const d of filtered) {
    if (d.type === 'dividendo') {
      divByTicker[d.ticker] = (divByTicker[d.ticker] ?? 0) + d.amount
    } else if (d.type === 'rendimento') {
      fiiByTicker[d.ticker] = (fiiByTicker[d.ticker] ?? 0) + d.amount
    }
  }

  const result: RendimentoIsento[] = []

  Object.entries(divByTicker).forEach(([ticker, amount]) => {
    result.push({ ticker, cnpj: '', type: 'Dividendos', code: '09', amount })
  })

  Object.entries(fiiByTicker).forEach(([ticker, amount]) => {
    result.push({ ticker, cnpj: '', type: 'Rendimentos de FII', code: '99', amount })
  })

  return result.sort((a, b) => a.ticker.localeCompare(b.ticker))
}

/** Rendimentos sujeitos à tributação exclusiva (JCP). */
export const calcRendimentosTributaveis = (dividends: Dividend[], year: number): RendimentoTributavel[] => {
  const filtered = dividends.filter((d) => d.paymentDate.startsWith(String(year)) && d.type === 'jcp')

  const byTicker: Record<string, { gross: number; ir: number }> = {}
  for (const d of filtered) {
    if (!byTicker[d.ticker]) byTicker[d.ticker] = { gross: 0, ir: 0 }
    byTicker[d.ticker].gross += d.amount
    byTicker[d.ticker].ir += d.ir ?? 0
  }

  return Object.entries(byTicker)
    .map(([ticker, { gross, ir }]) => ({
      ticker,
      cnpj: '',
      type: 'Juros sobre Capital Próprio',
      code: '10',
      gross,
      ir,
      net: gross - ir,
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker))
}

/** All years present in trades and dividends. */
export const availableYears = (trades: Trade[], dividends: Dividend[]): number[] => {
  const years = new Set<number>()
  trades.forEach((t) => years.add(Number(t.date.slice(0, 4))))
  dividends.forEach((d) => years.add(Number(d.paymentDate.slice(0, 4))))
  return [...years].filter((y) => y > 2000).sort((a, b) => b - a)
}
