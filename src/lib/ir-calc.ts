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
  // ações/BDR/ETF: 15%, isento se vendas de ações <= R$20k/mês
  stockSales: number
  stockGain: number
  stockIsExempt: boolean
  lossCarryoverIn: number
  stockNetTaxable: number
  irDueStock: number
  lossCarryoverOut: number
  // FII: 20%, sem isenção
  fiiSales: number
  fiiGain: number
  fiiNetTaxable: number
  irDueFii: number
  // totals (backward-compat)
  sales: number
  gain: number
  isExempt: boolean
  netTaxable: number
  irDue: number
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
  tesouro: { group: '04', code: '02' },
  fixed_income: { group: '04', code: '01' },
  crypto: { group: '08', code: '01' },
  stock_us: { group: '03', code: '04' },
  etf_us: { group: '07', code: '09' },
  other: { group: '99', code: '99' },
}

/* ── helpers ── */

const posKey = (ticker: string) => ticker.toUpperCase()

export interface TickerSets {
  fii: Set<string>
  stock: Set<string>
  bdr: Set<string>
}

// Fixed income products from B3 are identified by their product name prefix
const FIXED_INCOME_PREFIXES = [
  'TESOURO',
  'CDB',
  'LCI',
  'LCA',
  'CRI',
  'CRA',
  'LF ',
  'LFT',
  'NTN',
  'DEBENTURE',
  'DEBÊNTURE',
  'DEB',
]

export const isFixedIncomeTicker = (ticker: string): boolean => {
  const t = ticker.toUpperCase()
  return FIXED_INCOME_PREFIXES.some((p) => t.startsWith(p))
}

export const inferAssetType = (ticker: string, sets?: TickerSets): AssetType => {
  const t = ticker.toUpperCase()
  // Tesouro Direto — separate type from flat fixed income
  if (t.startsWith('TESOURO')) return 'tesouro'
  // flat fixed income check — these have long descriptive names, not stock codes
  if (isFixedIncomeTicker(t)) return 'fixed_income'
  if (sets) {
    if (sets.stock.has(t)) return 'stock'
    if (sets.fii.has(t)) return 'fii'
    if (sets.bdr.has(t)) return 'bdr'
  }
  // static fallbacks
  if (/^[A-Z]{4}3[2-5]$/.test(t)) return 'bdr'
  if (t.endsWith('11')) return 'fii'
  if (/[3-8]$/.test(t)) return 'stock'
  // letter-only tickers (e.g. AAPL, VOO, BRK.B) → US stock/ETF
  if (/^[A-Z]{1,6}(\.?[A-Z])?$/.test(t)) return 'stock_us' // etf_us inference requires ticker sets
  return 'other'
}

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
// Fixed income / Tesouro are manually maintained in the portfolio — use asset records
// directly instead of aggregating by ticker from trade history (which merges distinct
// products that share a generic ticker like "CDB-INTER").
const FLAT_INCOME_TYPES = new Set<AssetType>(['fixed_income', 'tesouro'])

export const buildPositions = (
  trades: Trade[],
  endDate: string,
  assets: Asset[],
  sets?: TickerSets,
): IrPosition[] => {
  const assetMap = Object.fromEntries(assets.map((a) => [a.ticker.toUpperCase(), a]))
  const map: PositionMap = {}

  // Exclude fixed income tickers from trade accumulation — handled separately below
  const flatIncomeTickers = new Set(
    assets.filter((a) => FLAT_INCOME_TYPES.has(a.type)).map((a) => a.ticker.toUpperCase()),
  )

  trades
    .filter((t) => t.date <= endDate && !flatIncomeTickers.has(t.ticker.toUpperCase()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) => applyTrade(map, t))

  const tradePositions: IrPosition[] = Object.entries(map)
    .filter(([, p]) => p.quantity > 0.0001)
    .map(([ticker, p]) => {
      const asset = assetMap[ticker]
      const type: AssetType = asset?.type ?? inferAssetType(ticker, sets)
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

  // One entry per portfolio asset for fixed income / tesouro (preserves distinct products)
  const flatIncomePositions: IrPosition[] = assets
    .filter((a) => FLAT_INCOME_TYPES.has(a.type) && a.quantity > 0)
    .map((a) => ({
      ticker: a.name, // use name as display key so distinct products show separately
      assetName: a.name,
      assetType: a.type,
      quantity: a.quantity,
      avgCost: a.currentPrice,
      totalCost: a.currentPrice * a.quantity,
      dirpfGroup: DIRPF[a.type].group,
      dirpfCode: DIRPF[a.type].code,
    }))

  return [...tradePositions, ...flatIncomePositions].sort((a, b) =>
    a.ticker.localeCompare(b.ticker),
  )
}

/** Realized gains for sells occurring in the given year. */
export const calcRealizedGains = (
  allTrades: Trade[],
  year: number,
  assets: Asset[],
  sets?: TickerSets,
): RealizedGain[] => {
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

    if (trade.type === 'buy') {
      applyTrade(map, trade)
      continue
    }
    if (trade.type !== 'sell') continue

    const soldQty = Math.min(trade.quantity, pos.quantity)
    const costTotal = pos.avgCost * soldQty
    const sellTotal = trade.price * soldQty

    if (Number(trade.date.slice(0, 4)) === year) {
      gains.push({
        ticker: trade.ticker.toUpperCase(),
        date: trade.date,
        month: trade.date.slice(0, 7),
        quantity: soldQty,
        avgCost: pos.avgCost,
        sellPrice: trade.price,
        sellTotal,
        costTotal,
        gain: sellTotal - costTotal,
        assetType: assetMap[key]?.type ?? inferAssetType(key, sets),
      })
    }

    pos.quantity = Math.max(0, pos.quantity - soldQty)
    pos.totalCost = pos.avgCost * pos.quantity
  }

  return gains
}

type MonthBucket = { stockSales: number; stockGain: number; fiiSales: number; fiiGain: number }

// Types exempt from DARF RV (taxed at source or via annual declaration)
export const RV_EXEMPT_TYPES = new Set<AssetType>(['tesouro', 'fixed_income', 'crypto', 'stock_us', 'etf_us'])

const aggregateByMonth = (gains: RealizedGain[]): Record<string, MonthBucket> => {
  const byMonth: Record<string, MonthBucket> = {}
  for (const g of gains) {
    if (RV_EXEMPT_TYPES.has(g.assetType)) continue
    if (!byMonth[g.month])
      byMonth[g.month] = { stockSales: 0, stockGain: 0, fiiSales: 0, fiiGain: 0 }
    if (g.assetType === 'fii') {
      byMonth[g.month].fiiSales += g.sellTotal
      byMonth[g.month].fiiGain += g.gain
    } else {
      byMonth[g.month].stockSales += g.sellTotal
      byMonth[g.month].stockGain += g.gain
    }
  }
  return byMonth
}

const calcStockTax = (stockSales: number, stockGain: number, carryover: number) => {
  const stockIsExempt = stockSales <= 20000 && stockGain > 0
  const afterCarry = (stockIsExempt ? 0 : stockGain) - carryover
  const stockNetTaxable = Math.max(0, afterCarry)
  let nextCarryover = carryover
  if (stockGain < 0) nextCarryover += Math.abs(stockGain)
  else if (!stockIsExempt) nextCarryover = afterCarry < 0 ? Math.abs(afterCarry) : 0
  return {
    stockIsExempt,
    stockNetTaxable,
    irDueStock: stockNetTaxable * 0.15,
    nextCarryover,
    lossCarryoverIn: carryover,
  }
}

/** Monthly renda variável aggregation from realized gains. */
export const calcMonthlyRV = (gains: RealizedGain[], year: number): MonthlyRV[] => {
  const byMonth = aggregateByMonth(gains)
  const result: MonthlyRV[] = []
  let carryover = 0

  for (let m = 1; m <= 12; m++) {
    const month = `${year}-${String(m).padStart(2, '0')}`
    const { stockSales = 0, stockGain = 0, fiiSales = 0, fiiGain = 0 } = byMonth[month] ?? {}

    const { stockIsExempt, stockNetTaxable, irDueStock, nextCarryover, lossCarryoverIn } =
      calcStockTax(stockSales, stockGain, carryover)
    carryover = nextCarryover

    const fiiNetTaxable = Math.max(0, fiiGain)
    const irDueFii = fiiNetTaxable * 0.2
    const irDue = irDueStock + irDueFii

    result.push({
      month,
      stockSales,
      stockGain,
      stockIsExempt,
      lossCarryoverIn,
      stockNetTaxable,
      irDueStock,
      lossCarryoverOut: carryover,
      fiiSales,
      fiiGain,
      fiiNetTaxable,
      irDueFii,
      sales: stockSales + fiiSales,
      gain: stockGain + fiiGain,
      isExempt: stockIsExempt && fiiSales === 0,
      netTaxable: stockNetTaxable + fiiNetTaxable,
      irDue,
    })
  }

  return result
}

/** Rendimentos isentos for the year from dividends. */
export const calcRendimentosIsentos = (dividends: Dividend[], year: number): RendimentoIsento[] => {
  // dividendo_ext is NOT isento — handled separately in calcRendimentosExterior
  const filtered = dividends.filter(
    (d) => d.paymentDate.startsWith(String(year)) && d.type !== 'dividendo_ext',
  )

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
export const calcRendimentosTributaveis = (
  dividends: Dividend[],
  year: number,
): RendimentoTributavel[] => {
  const filtered = dividends.filter(
    (d) => d.paymentDate.startsWith(String(year)) && d.type === 'jcp',
  )

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

export interface RendimentoExterior {
  ticker: string
  type: string
  gross: number
  ir: number
  net: number
}

/** Rendimentos do exterior (dividendo_ext) — tributáveis à alíquota progressiva. */
export const calcRendimentosExterior = (
  dividends: Dividend[],
  year: number,
  usdRate: number,
): RendimentoExterior[] => {
  const filtered = dividends.filter(
    (d) => d.paymentDate.startsWith(String(year)) && d.type === 'dividendo_ext',
  )

  const byTicker: Record<string, { gross: number; ir: number }> = {}
  for (const d of filtered) {
    if (!byTicker[d.ticker]) byTicker[d.ticker] = { gross: 0, ir: 0 }
    const gross = d.currency === 'USD' ? (d.amountUsd ?? 0) * usdRate : d.amount
    const ir = d.currency === 'USD' ? (d.irUsd ?? 0) * usdRate : (d.ir ?? 0)
    byTicker[d.ticker].gross += gross
    byTicker[d.ticker].ir += ir
  }

  return Object.entries(byTicker)
    .map(([ticker, { gross, ir }]) => ({
      ticker,
      type: 'Dividendos do Exterior',
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
