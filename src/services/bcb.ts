export interface BcbPoint {
  data: string // DD/MM/YYYY
  valor: string
}

const fetchSeries = async (code: number, startDate: string): Promise<BcbPoint[]> => {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${startDate}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BCB API error for series ${code}`)
  return res.json()
}

const parseDate = (ddmmyyyy: string): string => {
  const [d, m, y] = ddmmyyyy.split('/')
  return `${y}-${m}-${d}`
}

// Returns monthly accumulated return indexed to 100 starting from firstMonth (YYYY-MM)
const accumulate = (points: BcbPoint[], firstMonth: string): Record<string, number> => {
  let acc = 100
  const result: Record<string, number> = {}

  for (const p of points) {
    const isoDate = parseDate(p.data)
    const month = isoDate.slice(0, 7)
    if (month < firstMonth) continue
    const rate = Number.parseFloat(p.valor) / 100
    acc = acc * (1 + rate)
    result[month] = acc
  }

  return result
}

export interface BenchmarkData {
  cdi: Record<string, number>
  ipca: Record<string, number>
}

export const fetchBenchmarks = async (firstMonth: string): Promise<BenchmarkData> => {
  const m = firstMonth.slice(5, 7)
  const y = firstMonth.slice(0, 4)
  const startDate = `01/${m}/${y}`

  const [cdiRaw, ipcaRaw] = await Promise.all([
    fetchSeries(4391, startDate), // CDI mensal
    fetchSeries(433, startDate), // IPCA mensal
  ])

  return {
    cdi: accumulate(cdiRaw, firstMonth),
    ipca: accumulate(ipcaRaw, firstMonth),
  }
}
