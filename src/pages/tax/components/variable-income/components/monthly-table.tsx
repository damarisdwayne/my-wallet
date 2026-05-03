import type { ReactNode } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { MonthlyRV } from '@/lib/ir-calc'
import { darfDeadline, monthLabel } from '../../../utils'
import { Section, Td, Th } from '../../ui'

type Props = {
  monthly: MonthlyRV[]
  totalDarf: number
  children?: ReactNode
}

export const MonthlyTable = ({ monthly, totalDarf, children }: Props) => {
  return (
    <Section
      title="Detalhamento mensal"
      subtitle="Ações (15%, isento ≤ R$20k) · FII (20%, sem isenção)"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Mês</Th>
              <Th right>Vendas ações</Th>
              <Th right>Vendas FII</Th>
              <Th right>Resultado</Th>
              <Th right>Prej. acumulado</Th>
              <Th right>DARF ações</Th>
              <Th right>DARF FII</Th>
              <Th right>Total DARF</Th>
              <Th>Status</Th>
              <Th>Vencimento</Th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => {
              const hasOps = m.sales > 0
              return (
                <tr
                  key={m.month}
                  className={`border-t border-border/50 ${hasOps ? 'hover:bg-muted/20' : 'opacity-40'}`}
                >
                  <Td className="font-medium">{monthLabel(m.month)}</Td>
                  <Td right>{m.stockSales > 0 ? formatCurrency(m.stockSales) : '—'}</Td>
                  <Td right>{m.fiiSales > 0 ? formatCurrency(m.fiiSales) : '—'}</Td>
                  <Td right>
                    {hasOps ? (
                      <span className={m.gain >= 0 ? 'text-success' : 'text-destructive'}>
                        {formatCurrency(m.gain)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td right className="text-muted-foreground">
                    {m.lossCarryoverIn > 0 ? formatCurrency(-m.lossCarryoverIn) : '—'}
                  </Td>
                  <Td right>
                    {m.irDueStock > 0 ? (
                      <span className="text-destructive font-medium">
                        {formatCurrency(m.irDueStock)}
                      </span>
                    ) : m.stockSales > 0 && m.stockIsExempt ? (
                      <span className="text-success text-xs">Isento</span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td right>
                    {m.irDueFii > 0 ? (
                      <span className="text-destructive font-medium">
                        {formatCurrency(m.irDueFii)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td right>
                    {m.irDue > 0 ? (
                      <span className="text-destructive font-bold">{formatCurrency(m.irDue)}</span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td>
                    {!hasOps ? null : m.irDue > 0 ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        DARF
                      </span>
                    ) : m.stockIsExempt && m.fiiSales === 0 ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                        Isento
                      </span>
                    ) : m.gain < 0 ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        Prejuízo
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Zerado
                      </span>
                    )}
                  </Td>
                  <Td>
                    {m.irDue > 0 ? (
                      <span className="text-xs text-muted-foreground">{darfDeadline(m.month)}</span>
                    ) : null}
                  </Td>
                </tr>
              )
            })}
            {totalDarf > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td className="font-semibold" colSpan={7}>
                  Total DARF no ano
                </Td>
                <Td right className="font-semibold text-destructive">
                  {formatCurrency(totalDarf)}
                </Td>
                <Td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {children}
    </Section>
  )
}
