import { FileText } from 'lucide-react'

type Props = {
  effectiveYear: number
  years: number[]
  currentYear: number
  onSelectYear: (year: number) => void
}

export const PageHeader = ({ effectiveYear, years, currentYear, onSelectYear }: Props) => (
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <FileText size={20} />
        Imposto de Renda
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Informe para DIRPF · Ano-base {effectiveYear}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ano-base:</span>
      <div className="flex gap-1">
        {(years.length > 0 ? years : [currentYear]).map((y) => (
          <button
            key={y}
            onClick={() => onSelectYear(y)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              effectiveYear === y
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  </div>
)
