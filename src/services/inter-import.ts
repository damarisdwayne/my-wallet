import type { AssetType } from '@/types'
import type { B3Asset, B3ParseResult, B3RawTrade } from './b3-import'
import { fetchUsdBrlRate } from './quotes'

const US_ETF_TICKERS = new Set([
  'SPY',
  'VOO',
  'VTI',
  'QQQ',
  'IVV',
  'VNQ',
  'TLT',
  'BIL',
  'GLD',
  'SLV',
  'EEM',
  'EFA',
  'AGG',
  'BND',
  'LQD',
  'HYG',
  'XLK',
  'XLF',
  'XLE',
  'XLV',
  'VIG',
  'SCHD',
  'JEPI',
  'JEPQ',
  'SCHI',
  'SCHA',
  'SCHX',
  'SCHB',
  'ARKK',
  'ARKG',
  'ARKW',
  'ARKF',
  'ARKE',
  'DIA',
  'SOXX',
  'SMH',
  'CIBR',
  'BOTZ',
  'VGT',
  'VHT',
  'VFH',
  'VCR',
  'VDC',
  'VDE',
  'VIS',
  'VAW',
  'ITOT',
  'IEFA',
  'IEMG',
  'IAGG',
  'ISTB',
])

function inferUsType(ticker: string): AssetType {
  return US_ETF_TICKERS.has(ticker.toUpperCase()) ? 'etf' : 'stock_us'
}

interface TradeRow {
  ticker: string
  action: 'buy' | 'sell'
  quantity: number
  price: number
  date?: string
}

// Handles MM/DD/YY (old Apex) and M/D/YYYY (new Transaction Confirmation)
const parseUsDate = (d: string): string => {
  const [mo, day, y] = d.split('/')
  const year = y.length === 4 ? y : `20${y}`
  return `${year}-${mo.padStart(2, '0')}-${day.padStart(2, '0')}`
}

// PDF column-by-column extraction helper: \s+ crosses newlines so HEADER\s+([^\n]+) finds
// the data line immediately after each column header.
const colRe = (header: string) => new RegExp(`\\b${header.replace('/', '\\/')}\\s+([^\\n]+)`)
const colValue = (text: string, header: string) => (colRe(header).exec(text)?.[1] ?? '').trim()

// Old Apex Clearing Transaction Confirmation — headers: SYM / QTY / PRICE / B/S / Trade Date
function parseApexColumnar(text: string): TradeRow[] {
  const tickers = colValue(text, 'SYM')
    .split(/\s+/)
    .filter((t) => /^[A-Z]{1,6}$/.test(t))
  const quantities = colValue(text, 'QTY')
    .split(/\s+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => n > 0)
  const prices = colValue(text, 'PRICE')
    .split(/\s+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => n > 0)

  if (tickers.length === 0 || quantities.length < tickers.length || prices.length < tickers.length)
    return []

  const bsRaw = colValue(text, 'B/S')
  const actions: ('buy' | 'sell')[] = [...bsRaw.matchAll(/\b([BS])\s+[A-Z]/g)].map((m) =>
    m[1] === 'B' ? 'buy' : 'sell',
  )

  const dateRaw = colValue(text, 'Trade Date')
  const dates = [...dateRaw.matchAll(/(\d{1,2}\/\d{1,2}\/\d{2,4})/g)].map((m) => parseUsDate(m[1]))

  return tickers.map((ticker, i) => ({
    ticker,
    action: actions[i] ?? 'buy',
    quantity: quantities[i],
    price: prices[i],
    date: dates[i],
  }))
}

// New Inter Transaction Confirmation (Symbol/Action/Quantity/Price/Trade Date headers).
// pdfjs may emit this format as row-by-row (all columns on one line) OR split a single
// table row across two consecutive lines due to sub-pixel Y-coordinate rounding.
// Strategy: find each line that starts with a ticker, combine with the next line to tolerate
// splits, then skip the continuation line when it was consumed to avoid double-counting.
function parseNewConfirmFormat(text: string): TradeRow[] {
  if (!text.includes('Execution Time')) return []
  const lines = text.split('\n')
  const rows: TradeRow[] = []
  const tradeRe = /\bM\s+(Buy|Sell)\s+\S+\s+[AP]M\s+([\d.]+)\s+([\d.]+)\s+([\d/]+)/
  for (let i = 0; i < lines.length; i++) {
    const tickerMatch = /^\s*([A-Z]{1,6})\s/.exec(lines[i])
    if (!tickerMatch) continue
    const combined = lines[i] + ' ' + (lines[i + 1] ?? '')
    const tm = tradeRe.exec(combined)
    if (!tm) continue
    const qty = Number.parseFloat(tm[2])
    const price = Number.parseFloat(tm[3])
    if (qty > 0 && price > 0) {
      rows.push({
        ticker: tickerMatch[1],
        action: tm[1].toLowerCase() as 'buy' | 'sell',
        quantity: qty,
        price,
        date: parseUsDate(tm[4]),
      })
      // If match started in lines[i+1] (split row), skip that line to avoid re-matching it
      if (tm.index > lines[i].length) i++
    }
  }
  return rows
}

function parseTradeRows(text: string): TradeRow[] {
  // Trade Activity format (row-by-row): "BIL SPDR ... M Buy 2:45:47 PM 0.42 91.50 4/13/2026"
  const activityRe =
    /^\s*([A-Z]{1,6})\s+.+?\s+M\s+(Buy|Sell)\s+\S+\s+[AP]M\s+(\S+)\s+(\S+)\s+([\d/]+)/gm
  const activityRows: TradeRow[] = []
  let m: RegExpExecArray | null
  while ((m = activityRe.exec(text)) !== null) {
    const qty = Number.parseFloat(m[3])
    const price = Number.parseFloat(m[4])
    if (qty > 0 && price > 0)
      activityRows.push({
        ticker: m[1].toUpperCase(),
        action: m[2].toLowerCase() as 'buy' | 'sell',
        quantity: qty,
        price,
        date: parseUsDate(m[5]),
      })
  }
  if (activityRows.length > 0) return activityRows

  // New Inter Transaction Confirmation (Symbol/Quantity/Price headers) — row-by-row or line-split
  const newConfirmRows = parseNewConfirmFormat(text)
  if (newConfirmRows.length > 0) return newConfirmRows

  // Old Apex Clearing Transaction Confirmation columnar format (SYM / B/S / QTY / PRICE)
  return parseApexColumnar(text)
}

const round = (n: number, decimals: number) => Math.round(n * 10 ** decimals) / 10 ** decimals

function aggregateTrades(rows: TradeRow[]): B3Asset[] {
  const positions = new Map<
    string,
    { qty: number; totalCost: number; boughtQty: number; firstDate?: string }
  >()

  for (const row of rows) {
    const prev = positions.get(row.ticker) ?? { qty: 0, totalCost: 0, boughtQty: 0 }
    if (row.action === 'buy') {
      positions.set(row.ticker, {
        qty: prev.qty + row.quantity,
        totalCost: prev.totalCost + row.quantity * row.price,
        boughtQty: prev.boughtQty + row.quantity,
        firstDate: prev.firstDate ?? row.date,
      })
    } else {
      const newQty = Math.max(0, prev.qty - row.quantity)
      const newCost = newQty > 0 && prev.qty > 0 ? prev.totalCost * (newQty / prev.qty) : 0
      positions.set(row.ticker, {
        qty: newQty,
        totalCost: newCost,
        boughtQty: prev.boughtQty,
        firstDate: prev.firstDate,
      })
    }
  }

  const result: B3Asset[] = []
  for (const [ticker, { qty, totalCost, boughtQty, firstDate }] of positions) {
    if (qty > 0) {
      const avgPrice = totalCost / qty
      result.push({
        ticker,
        name: ticker,
        type: inferUsType(ticker),
        quantity: round(qty, 5),
        avgPrice: round(avgPrice, 7),
        currentPrice: round(avgPrice, 7),
        boughtQty: round(boughtQty, 5),
        operationDate: firstDate,
      })
    }
  }
  return result
}

export async function parseInterPdf(buffer: ArrayBuffer): Promise<B3ParseResult> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString()

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise
  const textParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageLines = new Map<number, string[]>()

    for (const item of content.items) {
      if (!('str' in item)) continue
      const y = Math.round((item as { transform: number[] }).transform[5])
      if (!pageLines.has(y)) pageLines.set(y, [])
      pageLines.get(y)!.push((item as { str: string }).str)
    }

    const sorted = [...pageLines.entries()].sort((a, b) => b[0] - a[0])
    for (const [, parts] of sorted) {
      textParts.push(parts.join(' '))
    }
  }

  const fullText = textParts.join('\n')
  const rows = parseTradeRows(fullText)

  if (rows.length === 0) {
    throw new Error(
      'Nenhuma negociação encontrada. Verifique se é uma nota de corretagem da Inter Co Securities.',
    )
  }

  const usdRate = await fetchUsdBrlRate()

  const trades: B3RawTrade[] = rows.map((r) => {
    const priceBrl = round(r.price * usdRate, 2)
    return {
      ticker: r.ticker,
      type: r.action,
      quantity: r.quantity,
      price: priceBrl,
      total: round(r.quantity * priceBrl, 2),
      date: r.date ?? '',
    }
  })

  const assets = aggregateTrades(rows)
  return {
    assets: assets.map((a) => ({
      ...a,
      avgPrice: round(a.avgPrice * usdRate, 2),
      currentPrice: round(a.currentPrice * usdRate, 2),
    })),
    trades,
    dividends: [],
  }
}
