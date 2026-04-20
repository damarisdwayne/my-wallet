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

function inferType(ticker: string): AssetType {
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

function cellStr(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function parsePrice(raw: unknown): number {
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

function parseQty(raw: unknown): number {
  if (typeof raw === 'number') return raw
  const s = cellStr(raw)
  return Number.parseFloat(s.replaceAll('.', '').replace(',', '.')) || 0
}

function normalizeTicker(ticker: string, mercado: string): string {
  const isFracionario = mercado.toLowerCase().includes('fracion')
  if (isFracionario && ticker.endsWith('F')) return ticker.slice(0, -1)
  return ticker
}

interface Cols {
  tipo: number
  mercado: number
  ticker: number
  qty: number
  price: number
}

function findCols(headers: string[]): Cols {
  const col = (kw: string) => headers.findIndex((h) => h.toLowerCase().includes(kw.toLowerCase()))
  return {
    tipo: col('Tipo de Movimentação'),
    mercado: col('Mercado'),
    ticker: col('Código de Negociação'),
    qty: col('Quantidade'),
    price: col('Preço'),
  }
}

interface Accumulator {
  netQty: number
  buysQty: number
  totalBuyCost: number
}

function applyRow(row: unknown[], cols: Cols, positions: Map<string, Accumulator>) {
  const rawTicker = cellStr(row[cols.ticker]).trim()
  if (rawTicker.length < 2) return

  const qty = parseQty(row[cols.qty])
  if (qty <= 0) return

  const tipo = cellStr(row[cols.tipo]).toLowerCase()
  const mercado = cellStr(row[cols.mercado])
  const ticker = normalizeTicker(rawTicker.toUpperCase(), mercado)
  const price = cols.price === -1 ? 0 : parsePrice(row[cols.price])
  const prev = positions.get(ticker) ?? { netQty: 0, buysQty: 0, totalBuyCost: 0 }

  if (tipo.includes('compra')) {
    positions.set(ticker, {
      netQty: prev.netQty + qty,
      buysQty: prev.buysQty + qty,
      totalBuyCost: prev.totalBuyCost + qty * price,
    })
  } else if (tipo.includes('venda')) {
    positions.set(ticker, { ...prev, netQty: prev.netQty - qty })
  }
}

function positionsToAssets(positions: Map<string, Accumulator>): B3Asset[] {
  const result: B3Asset[] = []
  for (const [ticker, { netQty, buysQty, totalBuyCost }] of positions) {
    if (netQty === 0) continue
    const avgPrice = buysQty > 0 ? totalBuyCost / buysQty : 0
    result.push({
      ticker,
      name: ticker,
      type: inferType(ticker),
      quantity: netQty,
      avgPrice,
      currentPrice: avgPrice,
      boughtQty: buysQty,
    })
  }
  return result
}

export function parseB3Excel(buffer: ArrayBuffer): B3Asset[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })

  const headerIdx = rows.findIndex((row) =>
    row.some((cell) => cellStr(cell).includes('Código de Negociação')),
  )
  if (headerIdx === -1) {
    throw new Error(
      'Formato inválido: cabeçalho não encontrado. Verifique se é o arquivo de Negociação da B3.',
    )
  }

  const headers = rows[headerIdx].map((h) => cellStr(h).trim())
  const cols = findCols(headers)

  if (cols.ticker === -1 || cols.qty === -1 || cols.tipo === -1) {
    throw new Error('Formato inválido: colunas obrigatórias não encontradas.')
  }

  const dataRows = rows.slice(headerIdx + 1).filter((r) => r.some((c) => cellStr(c).trim()))

  // Two-pass: buys first, then sells — avoids ordering issues in the spreadsheet
  const positions = new Map<string, Accumulator>()
  const isBuy = (row: unknown[]) => cellStr(row[cols.tipo]).toLowerCase().includes('compra')
  for (const row of dataRows) if (isBuy(row)) applyRow(row, cols, positions)
  for (const row of dataRows) if (!isBuy(row)) applyRow(row, cols, positions)

  const result = positionsToAssets(positions)
  if (result.length === 0) {
    throw new Error('Nenhuma posição encontrada. Verifique se o arquivo contém negociações.')
  }
  return result
}
