import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import type { B3ParseResult } from '@/services/b3-import'
import { typeLabel } from '../../../../constants'
import type { ParsedRow } from '../types'

interface TradesPreviewProps {
  rows: ParsedRow[]
  pendingDividends: B3ParseResult['dividends']
  onReset: () => void
}

export const TradesPreview = ({ rows, pendingDividends, onReset }: TradesPreviewProps) => {
  const newCount = rows.filter((r) => r.action === 'new').length
  const updateCount = rows.filter((r) => r.action === 'update').length
  const sellCount = rows.filter((r) => r.action === 'sell').length

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{rows.length} ativo(s):</span>
        {newCount > 0 && <span className="text-success font-medium">+{newCount} novos</span>}
        {updateCount > 0 && (
          <span className="text-foreground font-medium">{updateCount} a atualizar</span>
        )}
        {sellCount > 0 && (
          <span className="text-destructive font-medium">-{sellCount} vendas</span>
        )}
        {pendingDividends.length > 0 && (
          <span className="text-primary font-medium">
            {pendingDividends.length} provento(s)
          </span>
        )}
        <button onClick={onReset} className="ml-auto underline hover:text-foreground">
          Trocar arquivo
        </button>
      </div>
      <div className="overflow-y-auto flex-1 min-h-0 rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Ativo</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium text-right">Qtd</th>
              <th className="px-3 py-2 font-medium text-right">PM</th>
              <th className="px-3 py-2 font-medium text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.ticker}
                className="border-t border-border hover:bg-accent/20 transition-colors"
              >
                <td className="px-3 py-2 font-semibold text-foreground">{row.ticker}</td>
                <td className="px-3 py-2">
                  <Badge variant="secondary">{typeLabel[row.type]}</Badge>
                </td>
                <td className="px-3 py-2 text-right text-foreground">
                  {row.quantity % 1 === 0
                    ? row.quantity
                    : Number.parseFloat(row.quantity.toFixed(2))}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {row.avgPrice > 0 ? formatCurrency(row.avgPrice) : '—'}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      row.action === 'new'
                        ? 'bg-success/15 text-success'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {row.action === 'new' ? 'Novo' : 'Atualizar'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pendingDividends.length > 0 && (
          <>
            <div className="px-3 py-2 bg-muted/40 border-t border-border text-xs font-medium text-muted-foreground">
              Proventos ({pendingDividends.length})
            </div>
            {pendingDividends.map((d, i) => (
              <div
                key={`${d.ticker}-${d.paymentDate}-${i}`}
                className="flex items-center justify-between px-3 py-2 border-t border-border hover:bg-accent/20 transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground w-16">{d.ticker}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {d.type === 'dividendo'
                      ? 'Dividendo'
                      : d.type === 'jcp'
                        ? 'JCP'
                        : d.type === 'rendimento'
                          ? 'Rendimento'
                          : 'Div. Ext.'}
                  </Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {d.paymentDate.slice(8, 10)}/{d.paymentDate.slice(5, 7)}/
                    {d.paymentDate.slice(0, 4)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs tabular-nums">
                  {d.ir && d.ir > 0 && (
                    <span className="text-muted-foreground">IR: -{formatCurrency(d.ir)}</span>
                  )}
                  <span className="font-medium text-success">{formatCurrency(d.amount)}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        PM calculado pela média ponderada das compras.
      </p>
    </>
  )
}
