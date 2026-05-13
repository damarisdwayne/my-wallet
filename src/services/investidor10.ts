const BASE = '/api/investidor10'

interface SearchResult {
  ticker_id: number
  company_id: number
  name: string
  simple_name: string
  url: string
  type: string
}

interface IndicatorEntry {
  year: string
  value: number
  type: string
}

const searchTicker = async (ticker: string): Promise<SearchResult | null> => {
  const res = await fetch(`${BASE}/api/searchquery/${ticker.toLowerCase()}/compare/`).catch(
    () => null,
  )
  if (!res?.ok) return null
  const data = (await res.json()) as SearchResult[]
  if (!Array.isArray(data) || data.length === 0) return null
  const t = ticker.toLowerCase()
  return (
    data.find((r) => r.url?.includes(`/${t}/`) || r.simple_name?.toLowerCase() === t) ?? data[0]
  )
}

const tryTickers = async <T>(
  fn: (ticker: string) => Promise<T | null>,
  candidates: string[],
): Promise<T | null> => {
  for (const t of candidates) {
    const result = await fn(t)
    if (result) return result
  }
  return null
}

/* ─── Stock info (HTML scraping) ─────────────────────────────────── */

export type Investidor10StockInfo = Partial<{
  name: string
  sector: string
  subsector: string
  marketCap: string
  tagAlong: string
  foundedYear: string
  ipoYear: string
  about: string
}>

const scrapeStockInfo = async (ticker: string): Promise<Investidor10StockInfo | null> => {
  const res = await fetch(`${BASE}/acoes/${ticker.toLowerCase()}/`).catch(() => null)
  if (!res?.ok) return null
  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const name = doc.querySelector('h2.name-company')?.textContent?.trim()

  let sector: string | undefined
  let subsector: string | undefined
  let marketCap: string | undefined
  let tagAlong: string | undefined

  doc.querySelectorAll('#table-indicators-company .cell').forEach((cell) => {
    const title = cell.querySelector('.title')?.textContent?.trim()
    if (title === 'Setor') sector = cell.querySelector('.value')?.textContent?.trim()
    else if (title === 'Segmento') subsector = cell.querySelector('.value')?.textContent?.trim()
    else if (title === 'Valor de mercado')
      marketCap = cell.querySelector('.simple-value')?.textContent?.trim()
    else if (title === 'Tag Along') tagAlong = cell.querySelector('.value')?.textContent?.trim()
  })

  let foundedYear: string | undefined
  let ipoYear: string | undefined
  doc.querySelectorAll('#data_about table tr').forEach((row) => {
    const label = row.querySelector('td:first-child')?.textContent?.trim()
    const val = row.querySelector('td.value')?.textContent?.trim()
    if (label?.includes('fundação')) foundedYear = val
    else if (label?.includes('estreia')) ipoYear = val
  })

  const about = doc
    .querySelector('#about-company .about .text-content')
    ?.textContent?.trim()
    ?.replace(/\s+/g, ' ')

  if (!name && !sector) return null
  return { name, sector, subsector, marketCap, tagAlong, foundedYear, ipoYear, about }
}

export const fetchInvestidor10StockInfo = (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Investidor10StockInfo> =>
  tryTickers(scrapeStockInfo, [ticker, ...previousTickers]).then((r) => r ?? {})

/* ─── FII info (HTML scraping) ───────────────────────────────────── */

export type Investidor10FiiInfo = Partial<{
  name: string
  segment: string
  adminFee: string
  marketCap: string
  about: string
}>

const scrapeFiiInfo = async (ticker: string): Promise<Investidor10FiiInfo | null> => {
  const res = await fetch(`${BASE}/fiis/${ticker.toLowerCase()}/`).catch(() => null)
  if (!res?.ok) return null
  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const name = doc.querySelector('h2.name-company')?.textContent?.trim()

  let segment: string | undefined
  let adminFee: string | undefined
  let marketCap: string | undefined

  doc.querySelectorAll('#table-indicators .cell').forEach((cell) => {
    const label = cell.querySelector('.desc .name')?.textContent?.trim().toUpperCase()
    const val = cell.querySelector('.desc .value span')?.textContent?.trim()
    if (label === 'SEGMENTO') segment = val
    else if (label === 'TAXA DE ADMINISTRAÇÃO') adminFee = val
    else if (label === 'VALOR PATRIMONIAL') marketCap = val
  })

  const aboutParas = doc.querySelectorAll('#about-section p')
  const about =
    aboutParas.length > 0
      ? Array.from(aboutParas)
          .map((p) => p.textContent?.trim())
          .filter(Boolean)
          .join('\n\n')
      : undefined

  if (!name && !segment) return null
  return { name, segment, adminFee, marketCap, about }
}

export const fetchInvestidor10FiiInfo = (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Investidor10FiiInfo> =>
  tryTickers(scrapeFiiInfo, [ticker, ...previousTickers]).then((r) => r ?? {})

/* ─── Exterior ETF info (HTML scraping) ─────────────────────────── */

export type Investidor10ExteriorInfo = Partial<{
  name: string
  aum: string
  distributionYield: string
  about: string
}>

const scrapeExteriorInfo = async (ticker: string): Promise<Investidor10ExteriorInfo | null> => {
  const res = await fetch(`${BASE}/etfs-global/${ticker.toLowerCase()}/`).catch(() => null)
  if (!res?.ok) return null
  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const name = doc.querySelector('h2.name-company')?.textContent?.trim()

  let aum: string | undefined
  let distributionYield: string | undefined
  doc.querySelectorAll('._card').forEach((card) => {
    const header = card.querySelector('._card-header span')?.getAttribute('title') ?? ''
    const val = card.querySelector('._card-body span')?.textContent?.replaceAll(/\s+/g, ' ').trim()
    if (header === 'Capitalização') aum = val
    else if (header === 'DY') distributionYield = val
  })

  const aboutSection = doc.querySelector('#about-section')
  const about = aboutSection?.querySelector('p')?.textContent?.replaceAll(/\s+/g, ' ').trim()

  if (!name) return null
  return { name, aum, distributionYield, about }
}

export const fetchInvestidor10ExteriorInfo = (ticker: string): Promise<Investidor10ExteriorInfo> =>
  scrapeExteriorInfo(ticker).then((r) => r ?? {})

/* ─── Stock indicators (API) ─────────────────────────────────────── */

export type Investidor10StockIndicators = Partial<{
  priceEarnings: number
  priceToBook: number
  dividendYield: number
  payout: number
  profitMargins: number
  grossMargins: number
  ebitdaMargins: number
  evToEbitda: number
  returnOnEquity: number
  roic: number
  returnOnAssets: number
  debtToEquity: number
  netDebtToEbitda: number
  revenueGrowth: number
  earningsGrowth: number
}>

const getIndicator = (data: Record<string, IndicatorEntry[]>, key: string): number | undefined => {
  const list = data[key]
  if (!Array.isArray(list)) return undefined
  const atual = list.find((e) => e.year === 'Atual')
  return (atual ?? list[0])?.value ?? undefined
}

const fetchStockIndicators = async (
  ticker: string,
): Promise<Investidor10StockIndicators | null> => {
  const meta = await searchTicker(ticker)
  if (!meta?.ticker_id) return null

  const res = await fetch(`${BASE}/api/historico-indicadores/${meta.ticker_id}/5?v=2`).catch(
    () => null,
  )
  if (!res?.ok) return null

  const data = (await res.json()) as Record<string, IndicatorEntry[]>
  const get = (key: string) => getIndicator(data, key)

  return {
    priceEarnings: get('P/L'),
    priceToBook: get('P/VP'),
    dividendYield: get('Dividend Yield'),
    payout: get('Payout'),
    profitMargins: get('Margem Líquida'),
    grossMargins: get('Margem Bruta'),
    ebitdaMargins: get('Margem Ebtida'),
    evToEbitda: get('EV/Ebitda'),
    returnOnEquity: get('ROE'),
    roic: get('ROIC'),
    returnOnAssets: get('ROA'),
    debtToEquity: get('Dívida Bruta / Patrimônio'),
    netDebtToEbitda: get('Dívida Líquida / Ebitda'),
    revenueGrowth: get('CAGR Receitas 5 anos'),
    earningsGrowth: get('CAGR Lucros 5 anos'),
  }
}

export const fetchInvestidor10StockIndicators = (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Investidor10StockIndicators> =>
  tryTickers(fetchStockIndicators, [ticker, ...previousTickers]).then((r) => r ?? {})

/* ─── FII indicators (API) ───────────────────────────────────────── */

export type Investidor10FiiIndicators = Partial<{
  dividendYield: number
  priceToBook: number
}>

const fetchFiiIndicators = async (ticker: string): Promise<Investidor10FiiIndicators | null> => {
  const meta = await searchTicker(ticker)
  if (!meta?.ticker_id) return null

  const res = await fetch(`${BASE}/api/historico-indicadores/${meta.ticker_id}/5?v=2`).catch(
    () => null,
  )
  if (!res?.ok) return null

  const data = (await res.json()) as Record<string, IndicatorEntry[]>
  const get = (key: string) => getIndicator(data, key)

  return {
    dividendYield: get('Dividend Yield'),
    priceToBook: get('P/VP'),
  }
}

export const fetchInvestidor10FiiIndicators = (
  ticker: string,
  previousTickers: string[] = [],
): Promise<Investidor10FiiIndicators> =>
  tryTickers(fetchFiiIndicators, [ticker, ...previousTickers]).then((r) => r ?? {})
