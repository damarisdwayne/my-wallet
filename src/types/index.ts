/* ─── Expenses ─────────────────────────────────────────────────── */

export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'clothing'
  | 'subscriptions'
  | 'investments'
  | 'other'

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  source: 'manual' | 'bank'
}

/* ─── Investments ──────────────────────────────────────────────── */

export type AssetType =
  | 'stock'
  | 'fii'
  | 'bdr'
  | 'etf'
  | 'fixed_income'
  | 'crypto'
  | 'stock_us'
  | 'other'

export type PortfolioCategory = {
  id: string
  name: string
  targetPercent: number
  type: AssetType
  color: string
}

export type FixedIncomeType =
  | 'CDB'
  | 'LCI'
  | 'LCA'
  | 'LCE'
  | 'CRI'
  | 'CRA'
  | 'Debenture'
  | 'Tesouro IPCA+'
  | 'Tesouro Selic'
  | 'Tesouro Prefixado'
  | 'Outros'

export type RateType = 'prefixado' | 'pos_cdi' | 'ipca_plus' | 'igpm_plus' | 'pos_selic'

export interface Asset {
  id: string
  ticker: string
  name: string
  type: AssetType
  categoryId: string
  quantity: number
  avgPrice: number
  currentPrice: number
  targetPercent: number
  score?: number
  // Fixed income optional fields
  institution?: string
  fixedIncomeType?: FixedIncomeType
  rateType?: RateType
  indexerRate?: number
  prefixedRate?: number
  maturityDate?: string
  operationDate?: string
  issuer?: string
}

export interface Dividend {
  id: string
  ticker: string
  amount: number
  paymentDate: string
  type: 'dividendo' | 'jcp' | 'rendimento'
  ir?: number
}

export interface MonthlyResult {
  month: string // YYYY-MM
  ticker: string
  revenue: number
  netProfit: number
  eps: number // LPA
  dy?: number // dividend yield
  vacancy?: number // FII vacancy %
}

/* ─── Diagrama do Cerrado ──────────────────────────────────────── */

export interface DiagramQuestion {
  id: string
  text: string
}

export interface Diagram {
  id: string
  name: string
  appliesTo: AssetType[]
  questions: DiagramQuestion[]
}

export type AssetAnswers = Record<string, 0 | 1> // questionId → 0 (não) | 1 (sim)

/* ─── Import Records ───────────────────────────────────────────── */

export interface ImportItem {
  assetId: string
  ticker: string
  quantityDelta: number
  importAvgPrice: number
  previousQuantity: number
  previousAvgPrice: number
  wasCreated: boolean
}

export interface ImportRecord {
  id: string
  filename: string
  importedAt: string
  items: ImportItem[]
}

/* ─── Fundamentals ─────────────────────────────────────────────── */

export interface FundamentalSnapshot {
  fetchedAt: string
  priceEarnings: number | null
  priceToBook: number | null
  returnOnEquity: number | null
  profitMargins: number | null
  debtToEquity: number | null
  dividendYield: number | null
  earningsGrowth: number | null
  revenueGrowth: number | null
  grossMargins: number | null
  ebitdaMargins: number | null
  returnOnAssets: number | null
  sector: string | null
  industry: string | null
}

export interface PricePoint {
  date: string
  close: number
}

export interface FundamentalRecord {
  ticker: string
  updatedAt: string
  snapshots: FundamentalSnapshot[]
  priceHistory?: PricePoint[]
}

export interface FiiManualData {
  ticker: string
  vacancy: number | null
  propertyCount: number | null
  location: string
  manager: string
  adminFee: number | null
  avgContractDuration: string
  propertyQuality: string
  updatedAt: string
}

/* ─── CVM Documents ────────────────────────────────────────────── */

export interface CvmDocument {
  cnpj: string
  company: string
  cvmCode: string
  category: string
  type: string
  subject: string
  referenceDate: string
  deliveryDate: string
  downloadUrl: string
}

/* ─── Theme ────────────────────────────────────────────────────── */

export type Theme = 'light' | 'dark' | 'system'
