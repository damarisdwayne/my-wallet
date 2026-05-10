export type ReportType = 'ITR' | 'DFP' | 'InformensMensal'

export interface ReportEvent {
  ticker: string
  assetType: 'stock' | 'fii'
  reportType: ReportType
  period: string
  date: string // YYYY-MM-DD (CVM deadline)
}

// Next business day (skip Saturday/Sunday)
const nextBusinessDay = (d: Date): Date => {
  const r = new Date(d)
  if (r.getDay() === 6) r.setDate(r.getDate() + 2)
  else if (r.getDay() === 0) r.setDate(r.getDate() + 1)
  return r
}

const toIso = (d: Date) => d.toISOString().slice(0, 10)

const MONTH_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const generateReportEvents = (
  assets: { ticker: string; type: string }[],
  from: Date,
  to: Date,
): ReportEvent[] => {
  const events: ReportEvent[] = []
  const fromMs = from.getTime()
  const toMs = to.getTime()

  const inRange = (d: Date) => d.getTime() >= fromMs && d.getTime() <= toMs

  for (const asset of assets) {
    if (asset.type === 'fii') {
      // FII informe mensal: CVM deadline is 15th of the following month
      let cursor = new Date(from.getFullYear(), from.getMonth() - 1, 1)
      while (cursor <= to) {
        const refMonth = cursor.getMonth()
        const refYear = cursor.getFullYear()
        const deadline = nextBusinessDay(new Date(refYear, refMonth + 1, 15))
        if (inRange(deadline)) {
          events.push({
            ticker: asset.ticker,
            assetType: 'fii',
            reportType: 'InformensMensal',
            period: `${MONTH_PT[refMonth]} ${refYear}`,
            date: toIso(deadline),
          })
        }
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
      }
    } else if (asset.type === 'stock') {
      // Stock ITR deadlines: 45 days after quarter end
      // Q1 → May 14, Q2 → Aug 14, Q3 → Nov 14, DFP → Apr 30 (next year)
      const baseYear = from.getFullYear()
      const quarters = [
        { date: new Date(baseYear, 4, 14), reportType: 'ITR' as ReportType, period: `Q1 ${baseYear}` },
        { date: new Date(baseYear, 7, 14), reportType: 'ITR' as ReportType, period: `Q2 ${baseYear}` },
        { date: new Date(baseYear, 10, 14), reportType: 'ITR' as ReportType, period: `Q3 ${baseYear}` },
        { date: new Date(baseYear + 1, 3, 30), reportType: 'DFP' as ReportType, period: `Q4 ${baseYear}` },
        // also next year's Q1 in case range spans into next year
        { date: new Date(baseYear + 1, 4, 14), reportType: 'ITR' as ReportType, period: `Q1 ${baseYear + 1}` },
      ]
      for (const q of quarters) {
        const d = nextBusinessDay(q.date)
        if (inRange(d)) {
          events.push({ ticker: asset.ticker, assetType: 'stock', reportType: q.reportType, period: q.period, date: toIso(d) })
        }
      }
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
