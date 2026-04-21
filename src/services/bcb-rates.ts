interface BcbEntry {
  data: string // DD/MM/YYYY
  valor: string
}

const formatDateBcb = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const fetchSerie = async (
  serie: number,
  startDate: string,
  endDate: string,
): Promise<BcbEntry[]> => {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?dataInicial=${formatDateBcb(startDate)}&dataFinal=${formatDateBcb(endDate)}&formato=json`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    return (await res.json()) as BcbEntry[]
  } catch {
    return []
  }
}

// CDI diário (série 12) — CDB/LCI/LCA pós CDI
// indexerRate = % do CDI (ex: 110 = 110% do CDI)
export const calcCdiAccumulated = async (
  startDate: string,
  endDate: string,
  indexerRate: number,
): Promise<number> => {
  const data = await fetchSerie(12, startDate, endDate)
  if (data.length === 0) return 1
  return data.reduce(
    (acc, { valor }) => acc * (1 + (Number.parseFloat(valor) * (indexerRate / 100)) / 100),
    1,
  )
}

// Selic diária (série 11) — Tesouro Selic, poupança
// indexerRate = % da Selic (ex: 100 = 100% da Selic)
export const calcSelicAccumulated = async (
  startDate: string,
  endDate: string,
  indexerRate: number,
): Promise<number> => {
  const data = await fetchSerie(11, startDate, endDate)
  if (data.length === 0) return 1
  return data.reduce(
    (acc, { valor }) => acc * (1 + (Number.parseFloat(valor) * (indexerRate / 100)) / 100),
    1,
  )
}

// IPCA mensal (série 433) — retorna fator acumulado
export const calcIpcaAccumulated = async (startDate: string, endDate: string): Promise<number> => {
  const data = await fetchSerie(433, startDate, endDate)
  if (data.length === 0) return 1
  return data.reduce((acc, { valor }) => acc * (1 + Number.parseFloat(valor) / 100), 1)
}

// IGP-M mensal (série 189) — retorna fator acumulado
export const calcIgpmAccumulated = async (startDate: string, endDate: string): Promise<number> => {
  const data = await fetchSerie(189, startDate, endDate)
  if (data.length === 0) return 1
  return data.reduce((acc, { valor }) => acc * (1 + Number.parseFloat(valor) / 100), 1)
}

// Infers rate type from Tesouro Direto ticker name (e.g. "TESOURO IPCA+ 2029")
const inferTesouroRateType = (ticker: string): string => {
  const t = ticker.toUpperCase()
  if (t.includes('SELIC')) return 'pos_selic'
  if (t.includes('IPCA')) return 'ipca_plus'
  return 'prefixado'
}

export const calcTesouroValue = async (
  invested: number,
  quantity: number,
  ticker: string,
  operationDate: string,
  prefixedRate: number | undefined,
): Promise<number> => {
  const today = new Date().toISOString().slice(0, 10)
  const days =
    (Date.now() - new Date(operationDate + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 0) return invested

  const avgPrice = invested / quantity
  const rateType = inferTesouroRateType(ticker)

  if (rateType === 'pos_selic') {
    const factor = await calcSelicAccumulated(operationDate, today, 100)
    return avgPrice * factor * quantity
  }

  if (rateType === 'ipca_plus') {
    // Approximation: IPCA only, spread unknown for imported assets
    const factor = await calcIpcaAccumulated(operationDate, today)
    return avgPrice * factor * quantity
  }

  if (rateType === 'prefixado' && prefixedRate) {
    return avgPrice * Math.pow(1 + prefixedRate / 100, days / 365) * quantity
  }

  return invested
}

export const calcFixedIncomeValue = async (
  invested: number,
  rateType: string,
  indexerRate: number | undefined,
  prefixedRate: number | undefined,
  operationDate: string,
): Promise<number> => {
  const today = new Date().toISOString().slice(0, 10)
  const days =
    (Date.now() - new Date(operationDate + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24)

  if (days <= 0) return invested

  if (rateType === 'prefixado' && prefixedRate) {
    return invested * Math.pow(1 + prefixedRate / 100, days / 365)
  }

  if (rateType === 'pos_cdi' && indexerRate) {
    const factor = await calcCdiAccumulated(operationDate, today, indexerRate)
    return invested * factor
  }

  if (rateType === 'pos_selic' && indexerRate) {
    const factor = await calcSelicAccumulated(operationDate, today, indexerRate)
    return invested * factor
  }

  if (rateType === 'ipca_plus' && indexerRate) {
    const ipcaFactor = await calcIpcaAccumulated(operationDate, today)
    const spreadFactor = Math.pow(1 + indexerRate / 100, days / 365)
    return invested * ipcaFactor * spreadFactor
  }

  if (rateType === 'igpm_plus' && indexerRate) {
    const igpmFactor = await calcIgpmAccumulated(operationDate, today)
    const spreadFactor = Math.pow(1 + indexerRate / 100, days / 365)
    return invested * igpmFactor * spreadFactor
  }

  return invested
}
