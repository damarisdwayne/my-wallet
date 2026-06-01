import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency } from '@/lib/utils'
import type { ExtratoEntry } from '@/services/inter-extrato'
import type { ExtratoItem } from '../types'
import { ImportCheckbox } from './import-checkbox'

interface ExtratoPreviewProps {
  items: ExtratoItem[]
  unmappedFunds: ExtratoEntry[]
  usdRate: number
  onToggle: (key: string) => void
  onReset: () => void
}

const fmtDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`

const DUP_TIP = 'Já importado: mesma data e valor já existem. Desmarcado para não duplicar.'

export const ExtratoPreview = ({
  items,
  unmappedFunds,
  usdRate,
  onToggle,
  onReset,
}: ExtratoPreviewProps) => {
  const included = items.filter((i) => i.included).length
  const dupCount = items.filter((i) => i.duplicate).length

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="text-primary font-medium">
          {included}/{items.length} provento(s)
        </span>
        {dupCount > 0 && (
          <span className="text-warning font-medium">{dupCount} duplicata(s) detectada(s)</span>
        )}
        {unmappedFunds.length > 0 && (
          <span className="text-warning font-medium">
            {unmappedFunds.length} sem ticker mapeado
          </span>
        )}
        <span className="ml-auto text-muted-foreground">Cotação: R$ {usdRate.toFixed(2)}/USD</span>
        <button onClick={onReset} className="underline hover:text-foreground">
          Trocar arquivo
        </button>
      </div>

      {unmappedFunds.length > 0 && (
        <div className="rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-xs text-warning">
          Não importados (ticker desconhecido): {unmappedFunds.map((e) => e.fundName).join(', ')}
        </div>
      )}

      <div className="overflow-y-auto flex-1 rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
            <tr className="text-left text-muted-foreground">
              <th className="px-2 py-2 w-8" />
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Ticker</th>
              <th className="px-3 py-2 font-medium hidden sm:table-cell">Fundo</th>
              <th className="px-3 py-2 font-medium text-right">USD</th>
              <th className="px-3 py-2 font-medium text-right">IR (USD)</th>
              <th className="px-3 py-2 font-medium text-right">BRL est.</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ entry: e, key, duplicate, included: isIncluded }) => (
              <tr
                key={key}
                className={cn(
                  'border-t border-border transition-colors',
                  duplicate && 'bg-warning/5',
                  !isIncluded && 'opacity-50',
                )}
              >
                <td className="px-2 py-2">
                  <ImportCheckbox
                    checked={isIncluded}
                    onChange={() => onToggle(key)}
                    title={duplicate ? DUP_TIP : 'Incluir na importação'}
                  />
                </td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">{fmtDate(e.date)}</td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    {e.ticker}
                    {duplicate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] font-medium text-warning cursor-help">
                            ⚠ dup
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{DUP_TIP}</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </td>
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
    </TooltipProvider>
  )
}
