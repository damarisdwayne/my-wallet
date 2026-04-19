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

export type AssetType = 'stock' | 'fii' | 'bdr' | 'etf' | 'fixed_income' | 'crypto' | 'other'

export type PortfolioCategory = {
  id: string
  name: string
  targetPercent: number
  type: AssetType
  color: string
}

export interface Asset {
  id: string
  ticker: string
  name: string
  type: AssetType
  categoryId: string
  quantity: number
  avgPrice: number
  currentPrice: number
  targetPercent: number // within category
  score?: number // diagrama do cerrado score (1–10)
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

/* ─── Theme ────────────────────────────────────────────────────── */

export type Theme = 'light' | 'dark' | 'system'
