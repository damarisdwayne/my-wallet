export const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export const directPct = (v: number) => v.toFixed(2) + '%'
export const ratio = (v: number) => v.toFixed(2) + 'x'
export const num1 = (v: number) => v.toFixed(1) + 'x'

export const fmtDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

export const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export const verdictFromText = (text: string): { label: string; className: string } | null => {
  const lower = text.toLowerCase()
  if (lower.includes('otimista'))
    return { label: 'Otimista', className: 'bg-success/10 text-success border-success/20' }
  if (lower.includes('pessimista'))
    return {
      label: 'Pessimista',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    }
  if (lower.includes('neutro'))
    return { label: 'Neutro', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' }
  return null
}
