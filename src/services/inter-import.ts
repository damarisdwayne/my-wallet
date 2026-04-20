import type { AssetType } from '@/types'
import type { B3Asset } from './b3-import'

const US_ETF_TICKERS = new Set([
  'SPY', 'VOO', 'VTI', 'QQQ', 'IVV', 'VNQ', 'TLT', 'BIL', 'GLD', 'SLV',
  'EEM', 'EFA', 'AGG', 'BND', 'LQD', 'HYG', 'XLK', 'XLF', 'XLE', 'XLV',
  'VIG', 'SCHD', 'JEPI', 'JEPQ', 'SCHI', 'SCHA', 'SCHX', 'SCHB',
  'ARKK', 'ARKG', 'ARKW', 'ARKF', 'ARKE',
  'DIA', 'SOXX', 'SMH', 'CIBR', 'BOTZ',
  'VGT', 'VHT', 'VFH', 'VCR', 'VDC', 'VDE', 'VIS', 'VAW',
  'ITOT', 'IEFA', 'IEMG', 'IAGG', 'ISTB',
])

function inferUsType(ticker: string): AssetType {
  return US_ETF_TICKERS.has(ticker.toUpperCase()) ? 'etf' : 'stock_us'
}

interface TradeRow {
  ticker: string
  action: 'buy' | 'sell'
  quantity: number
  price: number
}

function parseTradeRows(text: string): TradeRow[] {
  const rows: TradeRow[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Pattern: TICKER ...words... M Buy/Sell HH:MM:SS AM/PM QTY PRICE DATE DATE ...
  // Example: "BIL SPDR SERIES TRUST ... M Buy 2:45:47 PM 0.42006888 91.5088 4/13/2026 ..."
  const tradeRe =
    /^([A-Z]{1,6})\s+.+?\s+M\s+(Buy|Sell)\s+\d+:\d+:\d+\s+[AP]M\s+([\d.]+)\s+([\d.]+)\s+\d+\/\d+\/\d+/

  for (const line of lines) {
    const m = tradeRe.exec(line)
    if (!m) continue
    const qty = Number.parseFloat(m[3])
    const price = Number.parseFloat(m[4])
    if (qty <= 0 || price <= 0) continue
    rows.push({
      ticker: m[1].toUpperCase(),
      action: m[2].toLowerCase() as 'buy' | 'sell',
      quantity: qty,
      price,
    })
  }

  return rows
}

function aggregateTrades(rows: TradeRow[]): B3Asset[] {
  const positions = new Map<string, { qty: number; totalCost: number }>()

  for (const row of rows) {
    const prev = positions.get(row.ticker) ?? { qty: 0, totalCost: 0 }
    if (row.action === 'buy') {
      positions.set(row.ticker, {
        qty: prev.qty + row.quantity,
        totalCost: prev.totalCost + row.quantity * row.price,
      })
    } else {
      const newQty = Math.max(0, prev.qty - row.quantity)
      const newCost = newQty > 0 && prev.qty > 0 ? prev.totalCost * (newQty / prev.qty) : 0
      positions.set(row.ticker, { qty: newQty, totalCost: newCost })
    }
  }

  const result: B3Asset[] = []
  for (const [ticker, { qty, totalCost }] of positions) {
    if (qty > 0) {
      const avgPrice = totalCost / qty
      result.push({
        ticker,
        name: ticker,
        type: inferUsType(ticker),
        quantity: qty,
        avgPrice,
        currentPrice: avgPrice,
      })
    }
  }
  return result
}

export async function parseInterPdf(buffer: ArrayBuffer): Promise<B3Asset[]> {
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

  return aggregateTrades(rows)
}
