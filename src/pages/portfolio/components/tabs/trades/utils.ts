import type { Trade } from '@/types'

export const tradeLabel = (t: Trade) => {
  if (t.label === 'bonificacao') return 'Bonificação'
  if (t.label === 'amortizacao') return 'Amortização'
  if (t.label === 'desdobramento') return 'Desdobramento'
  if (t.label === 'grupamento') return 'Grupamento'
  return t.type === 'buy' ? 'Compra' : 'Venda'
}

export const tradeColor = (t: Trade) =>
  t.type === 'buy' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'

export const sourceLabel = (t: Trade) =>
  t.source === 'b3_import' ? 'B3' : t.source === 'inter_import' ? 'Inter' : 'Manual'
