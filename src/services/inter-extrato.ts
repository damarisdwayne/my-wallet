import type { B3Dividend } from './b3-import'
import { fetchUsdBrlRate } from './quotes'

export interface ExtratoEntry {
  date: string
  fundName: string
  ticker: string | null
  amountUsd: number
  irUsd: number
}

const PT_MONTHS: Record<string, string> = {
  janeiro: '01', fevereiro: '02', março: '03', marco: '03', abril: '04',
  maio: '05', junho: '06', julho: '07', agosto: '08',
  setembro: '09', outubro: '10', novembro: '11', dezembro: '12',
}

const parsePtDate = (line: string): string | null => {
  const m = /^(\d{1,2}) de (\w+) de (\d{4})/.exec(line.trim())
  if (!m) return null
  const month = PT_MONTHS[m[2].toLowerCase()]
  if (!month) return null
  return `${m[3]}-${month}-${m[1].padStart(2, '0')}`
}

const parseUsdAmount = (s: string): number => {
  const m = /([+-]?)\s*US\$\s*([\d]*)[,.](\d{2})/.exec(s)
  if (!m) return 0
  const sign = m[1] === '-' ? -1 : 1
  const integer = m[2] || '0'
  return sign * Number.parseFloat(`${integer}.${m[3]}`)
}

// Fund full name → ticker (ordered by specificity)
const FUND_TICKER: [RegExp, string][] = [
  [/bloomberg.*1.?3.*month|state street.*spdr/i, 'BIL'],
  [/spdr series/i, 'BIL'],
  [/20\+.*year.*treasury|20.*plus.*year|treasury bond.*ishares|ishares.*20.*plus/i, 'TLT'],
  [/s&p.*500.*vanguard|vanguard.*s.?p.?500/i, 'VOO'],
  [/reit.*vanguard|vanguard.*specialized/i, 'VNQ'],
  [/invesco|powershares/i, 'SPHD'],
]

export const inferTickerFromFundName = (name: string): string | null => {
  for (const [re, ticker] of FUND_TICKER) {
    if (re.test(name)) return ticker
  }
  return null
}

interface RawEntry {
  date: string
  fundName: string
  amount: number
  isTax: boolean
}

const parseExtratoText = (text: string): RawEntry[] => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const result: RawEntry[] = []
  let currentDate: string | null = null
  let pendingType: 'div' | 'tax' | null = null
  let pendingText = ''

  const flush = (extra: string) => {
    if (!pendingType || !currentDate) {
      pendingType = null
      pendingText = ''
      return
    }
    const combined = `${pendingText} ${extra}`.replace(/\s+/g, ' ').trim()
    const amountMatch = /[+-]?\s*US\$\s*[\d.,]+/.exec(combined)
    if (!amountMatch) {
      pendingType = null
      pendingText = ''
      return
    }
    const typeLabel =
      pendingType === 'div' ? 'Pagamento De Dividendos' : 'Imposto Sobre Dividendos'
    const idx = combined.indexOf(typeLabel)
    if (idx === -1) {
      pendingType = null
      pendingText = ''
      return
    }
    const afterType = combined.slice(idx + typeLabel.length).trim()
    const fundName = afterType.split(/[+-]?\s*US\$\s*[\d.,]+/)[0].trim()
    const amount = parseUsdAmount(amountMatch[0])
    if (fundName && amount !== 0) {
      result.push({ date: currentDate, fundName, amount, isTax: pendingType === 'tax' })
    }
    pendingType = null
    pendingText = ''
  }

  for (const line of lines) {
    const date = parsePtDate(line)
    if (date) {
      if (pendingType) flush('')
      currentDate = date
      continue
    }
    if (pendingType) {
      if (/US\$/.test(line)) flush(line)
      else pendingText += ` ${line}`
      continue
    }
    const isDiv = line.startsWith('Pagamento De Dividendos')
    const isTax = line.startsWith('Imposto Sobre Dividendos')
    if (!isDiv && !isTax) continue
    pendingType = isDiv ? 'div' : 'tax'
    pendingText = line
    if (/US\$/.test(line)) flush('')
  }

  if (pendingType) flush('')
  return result
}

export const parseInterExtrato = async (
  buffer: ArrayBuffer,
): Promise<{ entries: ExtratoEntry[]; usdRate: number }> => {
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
    for (const [, parts] of sorted) textParts.push(parts.join(' '))
  }

  const raw = parseExtratoText(textParts.join('\n'))

  // Group by date + normalised fund name, net reversals algebraically
  const grouped = new Map<string, { div: number; tax: number; fundName: string; date: string }>()
  for (const entry of raw) {
    const key = `${entry.date}|${entry.fundName.toUpperCase().replace(/\s+/g, ' ')}`
    const g = grouped.get(key) ?? { div: 0, tax: 0, fundName: entry.fundName, date: entry.date }
    if (entry.isTax) g.tax += entry.amount
    else g.div += entry.amount
    grouped.set(key, g)
  }

  const entries: ExtratoEntry[] = []
  for (const { div, tax, fundName, date } of grouped.values()) {
    if (div < 0.005) continue
    entries.push({
      date,
      fundName,
      ticker: inferTickerFromFundName(fundName),
      amountUsd: Math.round(div * 100) / 100,
      irUsd: Math.round(Math.max(0, -tax) * 100) / 100,
    })
  }

  entries.sort((a, b) => a.date.localeCompare(b.date))
  const usdRate = await fetchUsdBrlRate()
  return { entries, usdRate }
}

export const extratoToDividends = (entries: ExtratoEntry[]): B3Dividend[] =>
  entries
    .filter((e) => e.ticker !== null)
    .map((e) => ({
      ticker: e.ticker!,
      amount: 0,
      amountUsd: e.amountUsd,
      paymentDate: e.date,
      type: 'dividendo_ext' as const,
      currency: 'USD' as const,
      ...(e.irUsd > 0 ? { irUsd: e.irUsd } : {}),
    }))
