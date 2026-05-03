import { formatCurrency } from '@/lib/utils'
import type { ExtratoEntry } from '@/services/inter-extrato'

interface ExtratoPreviewProps {
  entries: ExtratoEntry[]
  usdRate: number
  onReset: () => void
}

export const ExtratoPreview = ({ entries, usdRate, onReset }: ExtratoPreviewProps) => {
  const unmappedFunds = entries.filter((e) => e.ticker === null)
  const mappedEntries = entries.filter((e) => e.ticker !== null)

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{mappedEntries.length} provento(s) encontrado(s)</span>
        {unmappedFunds.length > 0 && (
          <span className="text-warning font-medium">
            {unmappedFunds.length} fundo(s) sem ticker mapeado
          </span>
        )}
        <span className="ml-auto text-muted-foreground">
          Cotação: R$ {usdRate.toFixed(2)}/USD
        </span>
        <button onClick={onReset} className="underline hover:text-foreground">
          Trocar arquivo
        </button>
      </div>

      {unmappedFunds.length > 0 && (
        <div className="rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-xs text-warning">
          Não importados (ticker desconhecido):{' '}
          {unmappedFunds.map((e) => e.fundName).join(', ')}
        </div>
      )}

      <div className="overflow-y-auto flex-1 rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Ticker</th>
              <th className="px-3 py-2 font-medium hidden sm:table-cell">Fundo</th>
              <th className="px-3 py-2 font-medium text-right">USD</th>
              <th className="px-3 py-2 font-medium text-right">IR (USD)</th>
              <th className="px-3 py-2 font-medium text-right">BRL est.</th>
            </tr>
          </thead>
          <tbody>
            {mappedEntries.map((e) => (
              <tr
                key={`${e.date}-${e.ticker ?? e.fundName}`}
                className="border-t border-border hover:bg-accent/20 transition-colors"
              >
                <td className="px-3 py-2 text-muted-foreground tabular-nums">
                  {e.date.slice(8, 10)}/{e.date.slice(5, 7)}/{e.date.slice(0, 4)}
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">{e.ticker}</td>
                <td className="px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell max-w-40 truncate">
                  {e.fundName}
                </td>
                <td className="px-3 py-2 text-right text-foreground tabular-nums">
                  ${e.amountUsd.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                  {e.irUsd > 0 ? `-$${e.irUsd.toFixed(2)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right text-success font-medium tabular-nums">
                  {formatCurrency(e.amountUsd * usdRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
