import * as XLSX from 'xlsx'
import type { AssetType } from '@/types'

export interface B3Asset {
  ticker: string
  name: string
  type: AssetType
  quantity: number // net delta for this period (can be negative)
  avgPrice: number // buy avg for this period (0 if no buys)
  currentPrice: number
  boughtQty: number // total units bought in this period
}

export interface B3Dividend {
  ticker: string
  amount: number
  paymentDate: string
  type: 'dividendo' | 'jcp' | 'rendimento'
  ir?: number
}

const ETF_TICKERS = new Set([
  'BOVA11',
  'SMAL11',
  'IVVB11',
  'DIVO11',
  'HASH11',
  'GOLD11',
  'SPXI11',
  'NASI11',
  'BOVB11',
  'BOVS11',
  'BOVV11',
  'ECOO11',
  'FIND11',
  'GOVE11',
  'IFNC11',
  'IMAB11',
  'ISUS11',
  'LEVE11',
  'MATB11',
  'MOBI11',
  'PIBB11',
  'SMAC11',
  'TRET11',
  'UTIP11',
  'XINA11',
  'XFIX11',
  'XBOV11',
])

const inferType = (ticker: string): AssetType => {
  if (ticker.startsWith('TESOURO')) return 'fixed_income'
  if (
    ticker.endsWith('34') ||
    ticker.endsWith('32') ||
    ticker.endsWith('33') ||
    ticker.endsWith('35')
  )
    return 'bdr'
  if (ticker.endsWith('11')) return ETF_TICKERS.has(ticker) ? 'etf' : 'fii'
  return 'stock'
}

const cellStr = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

const parsePrice = (raw: unknown): number => {
  if (typeof raw === 'number') return raw
  const s = cellStr(raw)
  return (
    Number.parseFloat(
      s
        .replaceAll(/R+\$\s*/g, '')
        .replaceAll('.', '')
        .replace(',', '.'),
    ) || 0
  )
}

const parseQty = (raw: unknown): number => {
  if (typeof raw === 'number') return raw
  const s = cellStr(raw)
  return Number.parseFloat(s.replaceAll('.', '').replace(',', '.')) || 0
}

const normalizeTicker = (ticker: string, mercado: string): string => {
  const isFracionario = mercado.toLowerCase().includes('fracion')
  if (isFracionario && ticker.endsWith('F')) return ticker.slice(0, -1)
  return ticker
}

// "BTHF11 - BTG PACTUAL REAL ESTATE..." → "BTHF11"
const extractTickerFromProduct = (produto: string): string =>
  produto
    .split(/\s+-\s+/)[0]
    .trim()
    .toUpperCase()

export interface B3RawTrade {
  ticker: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  total: number
  date: string // YYYY-MM-DD or '' if column not present
  label?: 'bonificacao' | 'desdobramento' | 'grupamento'
}

export interface B3ParseResult {
  assets: B3Asset[]
  trades: B3RawTrade[]
  dividends: B3Dividend[]
}

interface Cols {
  tipo: number
  mercado: number
  ticker: number
  qty: number
  price: number
  date: number
  total: number
  tickerFromProduct: boolean // true = Movimentação format; false = Negociação format
}

const findCols = (headers: string[]): Cols => {
  const col = (kw: string) => headers.findIndex((h) => h.toLowerCase().includes(kw.toLowerCase()))
  const tickerIdx = col('Código de Negociação')
  const produtoIdx = col('Produto')
  const valorTotalIdx = col('Valor Total')
  const valorOpIdx = col('Valor da Operação')
  return {
    tipo: col('Movimentação'), // matches both "Movimentação" and "Tipo de Movimentação"
    mercado: col('Mercado'),
    ticker: tickerIdx >= 0 ? tickerIdx : produtoIdx,
    qty: col('Quantidade'),
    price: col('Preço'), // matches "Preço" and "Preço Unitário"
    date: col('Data'),
    total: valorTotalIdx >= 0 ? valorTotalIdx : valorOpIdx,
    tickerFromProduct: tickerIdx < 0 && produtoIdx >= 0,
  }
}

const parseRowDate = (raw: unknown): string => {
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000))
    return d.toISOString().slice(0, 10)
  }
  const s = cellStr(raw).trim()
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return s
}

const MONTHS_PT: Record<string, string> = {
  janeiro: '01',
  fevereiro: '02',
  março: '03',
  abril: '04',
  maio: '05',
  junho: '06',
  julho: '07',
  agosto: '08',
  setembro: '09',
  outubro: '10',
  novembro: '11',
  dezembro: '12',
}

// Detects rows like "13 DE MARÇO DE 2026" (date section headers in B3 exports)
const parsePtDateRow = (row: unknown[]): string | null => {
  const firstNonEmpty = row.map((c) => cellStr(c).trim()).find(Boolean)
  if (!firstNonEmpty) return null
  const m = /^(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})$/i.exec(firstNonEmpty)
  if (!m) return null
  const month = MONTHS_PT[m[2].toLowerCase()]
  if (!month) return null
  return `${m[3]}-${month}-${m[1].padStart(2, '0')}`
}

interface Accumulator {
  netQty: number
  buysQty: number
  totalBuyCost: number
}

interface RowEvent {
  ticker: string
  qty: number
  price: number
  total: number
  date: string
}

const applyPosition = (
  tipo: string,
  ev: RowEvent,
  positions: Map<string, Accumulator>,
  trades: B3RawTrade[],
) => {
  const { ticker, qty, price, total, date } = ev
  const prev = positions.get(ticker) ?? { netQty: 0, buysQty: 0, totalBuyCost: 0 }

  if (tipo.includes('compra')) {
    positions.set(ticker, {
      netQty: prev.netQty + qty,
      buysQty: prev.buysQty + qty,
      totalBuyCost: prev.totalBuyCost + total,
    })
    trades.push({ ticker, type: 'buy', quantity: qty, price, total, date })
  } else if (tipo.includes('venda')) {
    positions.set(ticker, { ...prev, netQty: prev.netQty - qty })
    trades.push({ ticker, type: 'sell', quantity: qty, price, total, date })
  } else if (tipo.includes('bonifica')) {
    // Bonus shares at declared price (usually R$0) — adds qty, lowers PM proportionally
    positions.set(ticker, {
      netQty: prev.netQty + qty,
      buysQty: prev.buysQty + qty,
      totalBuyCost: prev.totalBuyCost + total,
    })
    trades.push({ ticker, type: 'buy', quantity: qty, price, total, date, label: 'bonificacao' })
  } else if (tipo.includes('desdobro')) {
    // Stock split — additional shares at R$0, total cost unchanged, PM decreases
    positions.set(ticker, {
      netQty: prev.netQty + qty,
      buysQty: prev.buysQty + qty,
      totalBuyCost: prev.totalBuyCost,
    })
    trades.push({
      ticker,
      type: 'buy',
      quantity: qty,
      price: 0,
      total: 0,
      date,
      label: 'desdobramento',
    })
  } else if (tipo.includes('grupamento')) {
    // Reverse split — shares removed, total cost unchanged, PM increases
    const newQty = Math.max(0, prev.netQty - qty)
    const ratio = prev.buysQty > 0 && prev.netQty > 0 ? newQty / prev.netQty : 1
    positions.set(ticker, {
      netQty: newQty,
      buysQty: prev.buysQty * ratio,
      totalBuyCost: prev.totalBuyCost,
    })
    trades.push({
      ticker,
      type: 'sell',
      quantity: qty,
      price: 0,
      total: 0,
      date,
      label: 'grupamento',
    })
  }
}

const applyDividend = (
  tipo: string,
  ticker: string,
  total: number,
  date: string,
  dividends: B3Dividend[],
) => {
  if (total <= 0) return
  const dividendType: 'dividendo' | 'jcp' | 'rendimento' = tipo.includes('juros')
    ? 'jcp'
    : tipo.includes('dividendo')
      ? 'dividendo'
      : 'rendimento'
  const ir = dividendType === 'jcp' ? total * 0.15 : undefined
  dividends.push({ ticker, amount: total, paymentDate: date, type: dividendType, ir })
}

const isDividendRow = (tipo: string) =>
  tipo === 'rendimento' || tipo.includes('dividendo') || tipo.includes('juros sobre capital')

interface ParseState {
  positions: Map<string, Accumulator>
  trades: B3RawTrade[]
  dividends: B3Dividend[]
}

// Movimentação format: dividends + Tesouro Direto trades only.
// Corporate events (desdobro, bonificação, grupamento) are intentionally skipped because
// the Negociação file already reflects the post-event position; processing them here
// causes double-counting. Add corporate events manually via the trade form.
// Tesouro Direto uses "Compra"/"Venda" directly in Movimentação (not Transferência),
// so it's safe to process here — stocks never use those tipos in this format.
const isTesouroBuy = (tipo: string) => tipo.includes('compra')
const isTesourSell = (tipo: string) =>
  tipo.includes('venda') || tipo.includes('vencimento') || tipo.includes('resgate')

const applyMovimentacao = (tipo: string, ev: RowEvent, total: number, state: ParseState) => {
  if (isDividendRow(tipo)) {
    applyDividend(tipo, ev.ticker, total, ev.date, state.dividends)
  } else if (ev.ticker.startsWith('TESOURO') && (isTesouroBuy(tipo) || isTesourSell(tipo))) {
    applyPosition(isTesourSell(tipo) ? 'venda' : tipo, ev, state.positions, state.trades)
  }
}

const applyRow = (row: unknown[], cols: Cols, date: string, state: ParseState) => {
  const rawTicker = cellStr(row[cols.ticker]).trim()
  if (rawTicker.length < 2) return

  const ticker = cols.tickerFromProduct
    ? extractTickerFromProduct(rawTicker)
    : normalizeTicker(rawTicker.toUpperCase(), cols.mercado >= 0 ? cellStr(row[cols.mercado]) : '')

  if (ticker.length < 2) return

  const qty = parseQty(row[cols.qty])
  if (qty <= 0) return

  const tipo = cellStr(row[cols.tipo]).toLowerCase().trim()
  const price = cols.price >= 0 ? parsePrice(row[cols.price]) : 0
  const total = cols.total >= 0 ? parsePrice(row[cols.total]) : qty * price

  if (cols.tickerFromProduct) {
    applyMovimentacao(tipo, { ticker, qty, price, total, date }, total, state)
  } else if (tipo.includes('compra') || tipo.includes('venda')) {
    applyPosition(tipo, { ticker, qty, price, total, date }, state.positions, state.trades)
  }
}

// Rounds away floating-point noise (e.g. 15.629999999999999 → 15.63, 2.08e-17 → 0)
const cleanQty = (n: number): number => {
  const r = Math.round(n * 1e6) / 1e6
  return Math.abs(r) < 1e-9 ? 0 : r
}

const positionsToAssets = (positions: Map<string, Accumulator>): B3Asset[] => {
  const result: B3Asset[] = []
  for (const [ticker, { netQty, buysQty, totalBuyCost }] of positions) {
    const qty = cleanQty(netQty)
    if (qty <= 0) continue
    const avgPrice = buysQty > 0 ? totalBuyCost / buysQty : 0
    result.push({
      ticker,
      name: ticker,
      type: inferType(ticker),
      quantity: qty,
      avgPrice,
      currentPrice: avgPrice,
      boughtQty: cleanQty(buysQty),
    })
  }
  return result
}

export const parseB3Excel = (buffer: ArrayBuffer): B3ParseResult => {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })

  // Supports old format ("Código de Negociação") and new format ("Produto" + "Quantidade")
  const headerIdx = rows.findIndex(
    (row) =>
      row.some(
        (cell) =>
          cellStr(cell).includes('Código de Negociação') || cellStr(cell).trim() === 'Produto',
      ) && row.some((cell) => cellStr(cell).toLowerCase().includes('quantidade')),
  )
  if (headerIdx === -1) {
    throw new Error(
      'Formato inválido: cabeçalho não encontrado. Verifique se é o Extrato de Movimentação da B3.',
    )
  }

  const headers = rows[headerIdx].map((h) => cellStr(h).trim())
  const cols = findCols(headers)

  if (cols.ticker === -1 || cols.qty === -1 || cols.tipo === -1) {
    throw new Error('Formato inválido: colunas obrigatórias não encontradas.')
  }

  // First pass: collect rows with resolved dates (handles section-header date rows)
  let contextDate = ''
  const sortableRows: Array<{ row: unknown[]; date: string }> = []

  for (const row of rows.slice(headerIdx + 1)) {
    if (!row.some((c) => cellStr(c).trim())) continue

    const sectionDate = parsePtDateRow(row)
    if (sectionDate) {
      contextDate = sectionDate
      continue
    }

    const date =
      cols.date !== -1 && cellStr(row[cols.date]).trim()
        ? parseRowDate(row[cols.date])
        : contextDate

    sortableRows.push({ row, date })
  }

  // Sort chronologically; same-day: buys/bonificações/desdobramentos before sells/grupamentos
  const typeOrder = (row: unknown[]) => {
    const t = cellStr(row[cols.tipo]).toLowerCase()
    return t.includes('compra') || t.includes('bonifica') || t.includes('desdobro') ? 0 : 1
  }
  sortableRows.sort((a, b) => {
    if (a.date < b.date) return -1
    if (a.date > b.date) return 1
    return typeOrder(a.row) - typeOrder(b.row)
  })

  const state: ParseState = {
    positions: new Map<string, Accumulator>(),
    trades: [],
    dividends: [],
  }

  for (const { row, date } of sortableRows) {
    applyRow(row, cols, date, state)
  }

  const assets = positionsToAssets(state.positions)
  if (assets.length === 0 && state.trades.length === 0 && state.dividends.length === 0) {
    throw new Error('Nenhuma posição encontrada. Verifique se o arquivo contém movimentações.')
  }
  return { assets, trades: state.trades, dividends: state.dividends }
}
