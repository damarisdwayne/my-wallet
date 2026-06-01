import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency } from '@/lib/utils'
import type { B3Dividend, B3RawTrade } from '@/services/b3-import'
import type { DividendItem, TradeItem } from '../types'
import { ImportCheckbox } from './import-checkbox'

interface TradesPreviewProps {
  tradeItems: TradeItem[]
  dividendItems: DividendItem[]
  onToggle: (key: string) => void
  onReset: () => void
}

const fmtDate = (iso: string) =>
  iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—'

const tradeLabel: Record<NonNullable<B3RawTrade['label']>, string> = {
  bonificacao: 'Bonificação',
  desdobramento: 'Desdobro',
  grupamento: 'Grupamento',
}

const dividendLabel: Record<B3Dividend['type'], string> = {
  dividendo: 'Dividendo',
  jcp: 'JCP',
  rendimento: 'Rendimento',
  dividendo_ext: 'Div. Ext.',
}

const dividendValue = (d: B3Dividend) =>
  d.currency === 'USD'
    ? `$${(d.amountUsd ?? 0).toFixed(2)}`
    : formatCurrency(d.amount > 0 ? d.amount : (d.amountBrl ?? 0))

const DUP_TIP = 'Já importado: mesma data, tipo e valor já existem. Desmarcado para não duplicar.'

export const TradesPreview = ({
  tradeItems,
  dividendItems,
  onToggle,
  onReset,
}: TradesPreviewProps) => {
  const includedTrades = tradeItems.filter((t) => t.included).length
  const includedDividends = dividendItems.filter((d) => d.included).length
  const dupCount =
    tradeItems.filter((t) => t.duplicate).length + dividendItems.filter((d) => d.duplicate).length

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {tradeItems.length > 0 && (
          <span className="text-foreground font-medium">
            {includedTrades}/{tradeItems.length} operação(ões)
          </span>
        )}
        {dividendItems.length > 0 && (
          <span className="text-primary font-medium">
            {includedDividends}/{dividendItems.length} provento(s)
          </span>
        )}
        {dupCount > 0 && (
          <span className="text-warning font-medium">{dupCount} duplicata(s) detectada(s)</span>
        )}
        <button onClick={onReset} className="ml-auto underline hover:text-foreground">
          Trocar arquivo
        </button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 rounded-md border border-border">
        {tradeItems.length > 0 && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <tr className="text-left text-muted-foreground">
                <th className="px-2 py-2 w-8" />
                <th className="px-3 py-2 font-medium">Ativo</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium text-right">Qtd</th>
                <th className="px-3 py-2 font-medium text-right">Preço</th>
                <th className="px-3 py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {tradeItems.map(({ trade: t, key, duplicate, included }) => (
                <tr
                  key={key}
                  className={cn(
                    'border-t border-border transition-colors',
                    duplicate && 'bg-warning/5',
                    !included && 'opacity-50',
                  )}
                >
                  <td className="px-2 py-2">
                    <ImportCheckbox
                      checked={included}
                      onChange={() => onToggle(key)}
                      title={duplicate ? DUP_TIP : 'Incluir na importação'}
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      {t.ticker}
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
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <Badge variant={t.type === 'buy' ? 'secondary' : 'outline'}>
                        {t.type === 'buy' ? 'Compra' : 'Venda'}
                      </Badge>
                      {t.label && (
                        <span className="text-[10px] text-muted-foreground">
                          {tradeLabel[t.label]}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground tabular-nums">
                    {fmtDate(t.date)}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground tabular-nums">
                    {t.quantity % 1 === 0 ? t.quantity : Number.parseFloat(t.quantity.toFixed(2))}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                    {t.price > 0 ? formatCurrency(t.price) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground tabular-nums">
                    {t.total > 0 ? formatCurrency(t.total) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {dividendItems.length > 0 && (
          <>
            <div className="px-3 py-2 bg-muted/40 border-t border-border text-xs font-medium text-muted-foreground sticky top-0">
              Proventos ({dividendItems.length})
            </div>
            {dividendItems.map(({ dividend: d, key, duplicate, included }) => (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 border-t border-border transition-colors text-sm',
                  duplicate && 'bg-warning/5',
                  !included && 'opacity-50',
                )}
              >
                <ImportCheckbox
                  checked={included}
                  onChange={() => onToggle(key)}
                  title={duplicate ? DUP_TIP : 'Incluir na importação'}
                />
                <span className="font-semibold text-foreground w-16">{d.ticker}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {dividendLabel[d.type]}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {fmtDate(d.paymentDate)}
                </span>
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
                <div className="ml-auto flex items-center gap-3 text-xs tabular-nums">
                  {((d.ir && d.ir > 0) || (d.irUsd && d.irUsd > 0)) && (
                    <span className="text-muted-foreground">
                      IR: -
                      {d.currency === 'USD'
                        ? `$${(d.irUsd ?? 0).toFixed(2)}`
                        : formatCurrency(d.ir ?? 0)}
                    </span>
                  )}
                  <span className="font-medium text-success">{dividendValue(d)}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Duplicatas (mesma data, tipo e valor já existentes) vêm desmarcadas. Revise antes de
        confirmar. PM recalculado pela média ponderada das compras marcadas.
      </p>
    </TooltipProvider>
  )
}
