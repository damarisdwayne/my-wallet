const BASE = '/api/statusinvest'

interface RawEntry {
  code: string
  companyName: string
  resultAbsoluteValue: string // "0,01724983"
  dateCom: string             // "DD/MM/YYYY"
  paymentDividend: string     // "DD/MM/YYYY" or "-"
  earningType: string         // "JCP" | "Dividendos" | "Rendimento"
  dy: string
}

interface RawResponse {
  datePayment?: RawEntry[]
  provisioned?: RawEntry[]
}

export interface UpcomingDividend {
  ticker: string
  companyName: string
  type: string
  dateCom: string        // YYYY-MM-DD
  paymentDate: string | null
  valuePerShare: number
  isProvisioned: boolean
  totalValue: number     // valuePerShare × quantity
}

const parseDate = (s: string): string | null => {
  if (!s || s === '-') return null
  const [d, m, y] = s.split('/')
  if (!d || !m || !y) return null
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

const parseValue = (s: string) => parseFloat((s ?? '0').replace(',', '.')) || 0

const processEntries = (
  entries: RawEntry[],
  tickerQty: Map<string, number>,
  isProvisioned: boolean,
  out: UpcomingDividend[],
) => {
  for (const e of entries) {
    const ticker = e.code.toUpperCase()
    const qty = tickerQty.get(ticker)
    if (qty === undefined) continue
    out.push({
      ticker,
      companyName: e.companyName,
      type: e.earningType,
      dateCom: parseDate(e.dateCom) ?? '',
      paymentDate: parseDate(e.paymentDividend),
      valuePerShare: parseValue(e.resultAbsoluteValue),
      isProvisioned,
      totalValue: parseValue(e.resultAbsoluteValue) * qty,
    })
  }
}

export const fetchUpcomingDividends = async (
  tickerQty: Map<string, number>,
  start: Date,
  end: Date,
): Promise<UpcomingDividend[]> => {
  if (tickerQty.size === 0) return []

  const s = start.toISOString().slice(0, 10)
  const e = end.toISOString().slice(0, 10)

  const [stockRes, fiiRes] = await Promise.all([
    fetch(`${BASE}?type=acao&start=${s}&end=${e}`).catch(() => null),
    fetch(`${BASE}?type=fii&start=${s}&end=${e}`).catch(() => null),
  ])

  const results: UpcomingDividend[] = []

  if (stockRes?.ok) {
    const data = (await stockRes.json()) as RawResponse
    processEntries(data.datePayment ?? [], tickerQty, false, results)
    processEntries(data.provisioned ?? [], tickerQty, true, results)
  }

  if (fiiRes?.ok) {
    const data = (await fiiRes.json()) as RawResponse
    processEntries(data.datePayment ?? [], tickerQty, false, results)
    processEntries(data.provisioned ?? [], tickerQty, true, results)
  }

  return results.sort((a, b) => {
    const da = a.paymentDate ?? '9999'
    const db = b.paymentDate ?? '9999'
    return da.localeCompare(db)
  })
}
