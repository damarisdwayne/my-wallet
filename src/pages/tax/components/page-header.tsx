import { FileText } from 'lucide-react'

type Props = {
  effectiveYear: number
  years: number[]
  currentYear: number
  onSelectYear: (year: number) => void
}

export const PageHeader = ({ effectiveYear, years, currentYear, onSelectYear }: Props) => (
  <div className="space-y-3">
    <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
      <FileText size={20} />
      Imposto de Renda
    </h1>

    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Declaração:</span>
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {(years.length > 0 ? years : [currentYear]).slice(0, 4).map((y) => (
          <button
            key={y}
            onClick={() => onSelectYear(y)}
            title={y === currentYear ? 'Ano-base ainda em andamento (não fechou)' : undefined}
            className={`shrink-0 px-3 py-1 rounded text-center leading-tight transition-colors ${
              effectiveYear === y
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-1 text-sm font-medium">
              {y + 1}
              {y === currentYear && <span aria-hidden>⏳</span>}
            </span>
            <span className="block text-[10px] font-normal opacity-70">ano-base {y}</span>
          </button>
        ))}
      </div>
    </div>

    <p className="text-xs text-muted-foreground">
      Declaração de <span className="font-medium text-foreground">{effectiveYear + 1}</span>,
      referente ao ano-base {effectiveYear}
      {effectiveYear === currentYear && ' (em andamento)'} — bens em 31/12/{effectiveYear - 1} e
      31/12/{effectiveYear}; rendimentos recebidos em {effectiveYear}.
    </p>
  </div>
)
