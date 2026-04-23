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

export interface FixedExpense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  startMonth: string // YYYY-MM
  endMonth?: string // undefined = indefinite
  createdAt: string
}

export interface InstallmentExpense {
  id: string
  description: string
  totalAmount: number
  installments: number
  installmentAmount: number
  startMonth: string // YYYY-MM
  category: ExpenseCategory
  createdAt: string
}

export interface DisplayExpense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  source: 'manual' | 'bank' | 'fixed' | 'installment'
  installmentNumber?: number
  totalInstallments?: number
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

/* ─── Critérios de Alocação ────────────────────────────────────── */

export interface DiagramQuestion {
  id: string
  text: string
}

export interface Diagram {
  id: string
  name: string
  categoryId: string
  appliesTo?: AssetType[] // legacy — kept for backward compat
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
  // Stock / shared
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
  // Stock - extended
  roic?: number | null
  netDebtToEbitda?: number | null
  evToEbitda?: number | null
  fcf?: number | null
  fcfYield?: number | null
  cashConversion?: number | null
  pegRatio?: number | null
  payout?: number | null
  // FII - todos
  majorRevenueConcentration?: string | null
  // FII - tijolo
  physicalVacancy?: number | null
  financialVacancy?: number | null
  propertyCount?: number | null
  tenantCount?: number | null
  propertyQuality?: string | null
  noiPerSqm?: number | null
  salesPerSqm?: number | null
  operators?: string | null
  regionDiversification?: string | null
  rentalContracts?: string | null
  avgContractDuration?: string | null
  // Shared notes
  notes?: string | null
  // FII - papel
  creditQuality?: string | null
  indexationType?: string | null
  debtorConcentration?: string | null
  paperSegments?: string | null
  spread?: number | null
  ltv?: number | null
  defaultRate?: number | null
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

export interface FiiInfo {
  ticker: string
  longName: string
  cnpj: string
  startDate: string
  segment: string
  marketCap: string
  adminName: string
  adminFee: string
  performanceFee: string
  updatedAt: string
}

export interface StockInfo {
  ticker: string
  companyName: string
  sector: string
  subsector: string
  about: string
  foundedYear: string
  ipoYear: string
  marketCap: string
  governanceLevel: string
  controller: string
  geographicExposure: string
  tagAlong: string
  updatedAt: string
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

/* ─── Trades (investment transaction log) ─────────────────────── */

export interface Trade {
  id: string
  ticker: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  total: number
  date: string // YYYY-MM-DD
  source: 'b3_import' | 'inter_import' | 'manual'
  importId?: string
  label?: string // e.g. 'bonificacao', 'amortizacao'
}

/* ─── Sales ─────────────────────────────────────────────────────── */

export type SaleCategory =
  | 'gpu'
  | 'cpu'
  | 'ram'
  | 'ssd'
  | 'hdd'
  | 'notebook'
  | 'smartphone'
  | 'console'
  | 'periferico'
  | 'outro'

export interface SaleItem {
  id: string
  name: string
  category: SaleCategory
  buyPrice: number
  boughtAt: string // YYYY-MM-DD
  notes?: string
  sellPrice?: number
  soldAt?: string // set when sold; undefined = still in stock
}
