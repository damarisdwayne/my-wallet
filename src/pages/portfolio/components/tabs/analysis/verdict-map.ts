export const VERDICT_MAP: Record<string, { label: string; className: string }> = {
  bullish: {
    label: 'Otimista',
    className: 'bg-success/10 text-success border-success/20',
  },
  neutro: {
    label: 'Neutro',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  bearish: {
    label: 'Pessimista',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}
