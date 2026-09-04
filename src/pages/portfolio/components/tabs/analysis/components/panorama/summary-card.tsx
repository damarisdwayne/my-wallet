import { ChevronRight } from 'lucide-react'
import { verdictFromText, verdictSummaryFromText } from '../../utils'
import type { AiAnalysis } from '@/types'

interface Props {
  analysis: AiAnalysis
  onClick: () => void
}

export const AnalysisSummaryCard = ({ analysis, onClick }: Props) => {
  const verdict = verdictFromText(analysis.text)
  const summary = verdictSummaryFromText(analysis.text)

  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/20 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{analysis.ticker}</p>
          <p className="text-[10px] text-muted-foreground/70 truncate">
            {analysis.documentType ?? 'Relatório'}
            {analysis.reportDate ? ` · ${analysis.reportDate}` : ''}
          </p>
        </div>
        {verdict && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${verdict.className}`}
          >
            {verdict.label}
          </span>
        )}
      </div>

      {summary && (
        <p className="text-xs leading-relaxed text-foreground/75 line-clamp-6">{summary}</p>
      )}

      {/* Not a nested <button> — the whole card is already the click target. */}
      <span className="mt-auto flex items-center gap-0.5 pt-1 text-[10px] font-medium text-primary/70">
        Ler análise
        <ChevronRight size={11} />
      </span>
    </button>
  )
}
