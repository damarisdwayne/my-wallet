/* ─── Pluggy Open Finance Types ─────────────────────────────────── */

export type PluggyItemStatus =
  | 'UPDATED'
  | 'UPDATING'
  | 'LOGIN_ERROR'
  | 'OUTDATED'
  | 'WAITING_USER_INPUT'

export interface PluggyConnector {
  id: number
  name: string
  institutionUrl: string
  imageUrl: string
  primaryColor: string
}

export interface PluggyItem {
  id: string
  connectorId: number
  status: PluggyItemStatus
  lastUpdatedAt: string
  connector: PluggyConnector
}

// ─── Stored item reference in Firestore ───────────────────────────

export interface PluggyConnectedItem {
  itemId: string
  connectorName: string
  connectorImageUrl: string
  status: PluggyItemStatus
  connectedAt: string
  lastUpdatedAt: string
}

// ─── Accounts ─────────────────────────────────────────────────────

export type PluggyAccountType = 'BANK' | 'CREDIT'
export type PluggyAccountSubtype =
  | 'CHECKING_ACCOUNT'
  | 'SAVINGS_ACCOUNT'
  | 'CREDIT_CARD'
  | 'SALARY_ACCOUNT'

export interface PluggyCreditData {
  creditLimit: number
  availableCreditLimit: number
  balanceCloseDate: string
  balanceDueDate: string
  minimumPayment: number
}

export interface PluggyAccount {
  id: string
  itemId: string
  name: string
  number: string
  type: PluggyAccountType
  subtype: PluggyAccountSubtype
  balance: number
  currencyCode: string
  creditData?: PluggyCreditData
}

// ─── Transactions ─────────────────────────────────────────────────

export type PluggyTransactionType = 'DEBIT' | 'CREDIT'

export interface PluggyTransaction {
  id: string
  accountId: string
  date: string // ISO
  description: string
  amount: number // always positive; use type to determine direction
  type: PluggyTransactionType
  category?: string
  categoryId?: string
  balance?: number
  currencyCode: string
  providerCode?: string
}

export interface PluggyTransactionsPage {
  total: number
  totalPages: number
  page: number
  results: PluggyTransaction[]
}

// ─── Investments ──────────────────────────────────────────────────

export type PluggyInvestmentType =
  | 'MUTUAL_FUND'
  | 'EQUITY'
  | 'FIXED_INCOME'
  | 'ETF'
  | 'SECURITY'
  | 'TREASURE' // Tesouro Direto

export interface PluggyInvestment {
  id: string
  itemId: string
  name: string
  code?: string // ticker (e.g. PETR4, MXRF11)
  type: PluggyInvestmentType
  subtype?: string
  balance: number // current market value in BRL
  quantity?: number
  value?: number // unit price
  annualRate?: number // rate for fixed income
  date?: string // maturity date for fixed income
  lastUpdatedAt: string
  currencyCode: string
  issuer?: string
  isin?: string
}

export interface PluggyInvestmentsPage {
  total: number
  results: PluggyInvestment[]
}
