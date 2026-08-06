import type { Dividend } from '@/types'

const TYPE_LABELS: Record<Dividend['type'], string> = {
  dividendo: 'Dividendo',
  dividendo_ext: 'Dividendo Ext',
  jcp: 'JCP',
  rendimento: 'Rendimento',
}

const TYPE_COLORS: Record<Dividend['type'], string> = {
  dividendo: 'bg-success/15 text-success',
  dividendo_ext: 'bg-secondary text-secondary-foreground',
  jcp: 'bg-warning/15 text-warning',
  rendimento: 'bg-primary/15 text-primary',
}

export const dividendLabel = (d: Dividend) => TYPE_LABELS[d.type] ?? d.type
export const dividendColor = (d: Dividend) => TYPE_COLORS[d.type] ?? 'bg-muted text-foreground'

/** Dividends carry no source field — every one comes from an import, so infer by currency. */
export const dividendSourceLabel = (d: Dividend) =>
  d.currency === 'USD' || d.type === 'dividendo_ext' ? 'Inter' : 'B3'
