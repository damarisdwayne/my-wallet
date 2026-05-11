import type { AssetType, FixedIncomeType, RateType } from '@/types'

export const TYPE_GROUPS: { label: string; types: AssetType[] }[] = [
  { label: 'Renda Variável BR', types: ['stock', 'fii', 'etf', 'bdr'] },
  { label: 'Internacional', types: ['stock_us'] },
  { label: 'Outros', types: ['crypto', 'fixed_income', 'other'] },
]

export const FIXED_INCOME_TYPES: FixedIncomeType[] = [
  'CDB',
  'LCI',
  'LCA',
  'LCE',
  'CRI',
  'CRA',
  'Debenture',
  'Tesouro IPCA+',
  'Tesouro Selic',
  'Tesouro Prefixado',
  'Outros',
]

export const RATE_TYPES: { value: RateType; label: string }[] = [
  { value: 'pos_cdi', label: 'CDI' },
  { value: 'ipca_plus', label: 'IPCA+' },
  { value: 'igpm_plus', label: 'IGP-M+' },
  { value: 'pos_selic', label: 'SELIC' },
  { value: 'prefixado', label: 'Prefixado' },
]

export const KNOWN_CRYPTOS = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'BNB', name: 'BNB' },
  { ticker: 'ADA', name: 'Cardano' },
  { ticker: 'XRP', name: 'XRP' },
  { ticker: 'DOT', name: 'Polkadot' },
  { ticker: 'AVAX', name: 'Avalanche' },
  { ticker: 'MATIC', name: 'Polygon' },
  { ticker: 'LINK', name: 'Chainlink' },
  { ticker: 'UNI', name: 'Uniswap' },
  { ticker: 'ATOM', name: 'Cosmos' },
]

export type OpMode = 'buy' | 'sell' | 'bonificacao' | 'amortizacao'

export const OP_MODES: { value: OpMode; label: string; desc: string }[] = [
  { value: 'buy', label: 'Compra', desc: 'Registrar compra ou adicionar ativo' },
  { value: 'sell', label: 'Venda', desc: 'Registrar venda de ativo' },
  { value: 'bonificacao', label: 'Bonificação', desc: 'Cotas recebidas como bonificação' },
  { value: 'amortizacao', label: 'Amortização', desc: 'Amortização de ativo' },
]

export const todayStr = new Date().toISOString().slice(0, 10)

export const inputClass =
  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export const RATE_LABEL: Record<RateType, string> = {
  prefixado: 'Pré',
  pos_cdi: 'Pós CDI',
  ipca_plus: 'IPCA+',
  igpm_plus: 'IGP-M+',
  pos_selic: 'Pós SELIC',
}

export const TESOURO_RATE_TYPE: Partial<Record<FixedIncomeType, RateType>> = {
  'Tesouro IPCA+': 'ipca_plus',
  'Tesouro Selic': 'pos_selic',
  'Tesouro Prefixado': 'prefixado',
}
