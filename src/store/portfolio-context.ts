import { atom } from 'jotai'

export interface PortfolioContextData {
  totalValue: number
  totalInvested: number
  returnPercent: number
  assets: Array<{
    ticker: string
    name: string
    type: string
    currentPrice: number
    quantity: number
    avgPrice: number
    totalValue: number
    returnPercent: number
    maturityDate?: string
    fixedIncomeType?: string
    institution?: string
    rateType?: string
    indexerRate?: number
    prefixedRate?: number
  }>
  categories: Array<{
    name: string
    targetPercent: number
    currentValue: number
    currentPercent: number
  }>
}

export const portfolioContextAtom = atom<PortfolioContextData | null>(null)

export const buildPortfolioContext = (data: PortfolioContextData): string => {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const lines: string[] = [
    `Patrimônio total: ${fmt(data.totalValue)}`,
    `Total investido: ${fmt(data.totalInvested)}`,
    `Retorno total: ${data.returnPercent.toFixed(2)}%`,
    '',
    '--- ALOCAÇÃO POR CATEGORIA ---',
    ...data.categories.map(
      (c) =>
        `${c.name}: ${fmt(c.currentValue)} (${c.currentPercent.toFixed(1)}% atual / ${c.targetPercent}% meta)`,
    ),
    '',
    '--- ATIVOS ---',
    ...data.assets.map((a) => {
      const base = `${a.ticker} | ${a.type} | Qtd: ${a.quantity} | Preço médio: ${fmt(a.avgPrice)} | Valor atual: ${fmt(a.totalValue)} | Retorno: ${a.returnPercent.toFixed(1)}%`
      if (a.maturityDate) return `${base} | Vencimento: ${a.maturityDate}`
      return base
    }),
  ]

  return lines.join('\n')
}
