import { calcRendimentosIsentos } from '@/lib/ir-calc'
import { formatCurrency } from '@/lib/utils'
import type { Dividend } from '@/types'
import { AmountBadge, EmptyRow, Section, Td, Th } from './ui'

type Props = {
  year: number
  dividends: Dividend[]
}

export const ExemptIncomeSection = ({ year, dividends }: Props) => {
  const items = calcRendimentosIsentos(dividends, year)
  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <Section
      title="Rendimentos Isentos e Não Tributáveis"
      subtitle="Ficha de Rendimentos Isentos — DIRPF"
      badge={<AmountBadge label="Total isento" value={total} variant="success" />}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Cód.</Th>
              <Th>Tipo</Th>
              <Th>Ticker / Fonte</Th>
              <Th right>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow cols={4} message="Nenhum rendimento isento no ano selecionado." />
            ) : (
              items.map((item, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                  <Td>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-mono font-semibold">
                      {item.code}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{item.type}</Td>
                  <Td className="font-semibold text-foreground">{item.ticker}</Td>
                  <Td right className="text-success font-medium">
                    {formatCurrency(item.amount)}
                  </Td>
                </tr>
              ))
            )}
            {items.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td colSpan={3} className="font-semibold">
                  Total
                </Td>
                <Td right className="font-semibold text-success">
                  {formatCurrency(total)}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
